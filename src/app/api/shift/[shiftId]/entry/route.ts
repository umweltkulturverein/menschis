import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { db } from "@/db";
import { CreateShiftEntry } from "@/lib/db/shiftEntries";
import {
  FindOrCreatePersonByEmail,
  GetPersonBySub,
  UpdatePersonPhone,
  type Person,
} from "@/lib/db/persons";
import { sendMagicLink, sendShiftEntryEmail } from "@/lib/email/email";
import { NextResponse } from "next/server";
import { isInternalUser } from "@/lib/auth/permissions";
import { readShiftAccess } from "@/lib/auth/shiftAccess";
import { GetEventDay } from "@/lib/db/eventDays";
import { GetEvent } from "@/lib/db/events";
import { GetShiftById } from "@/lib/db/shifts";
import { GetShiftKindById } from "@/lib/db/shiftKinds";
import { IssueOrder } from "@/lib/ticket/main";
import { ValidateTurnstile } from "@/lib/auth/captcha";
import type { Shift, ShiftEntry, ShiftKind } from "@/types/shift";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ shiftId: string }> },
) {
  const session = await getServerSession(authOptions);
  const { name, email, phone, notes, captchaChallenge } = await req.json();
  const { shiftId: shiftIdParam } = await params;
  const shiftId = parseInt(shiftIdParam);
  if (isNaN(shiftId)) {
    return NextResponse.json({ error: "Invalid shift ID" }, { status: 400 });
  }

  const sessionEmail = session?.user?.email?.trim().toLowerCase();
  const formEmail = email?.trim().toLowerCase();
  const isSignedInUser = !!sessionEmail && sessionEmail === formEmail;

  const validationError = await validateSignUp({
    shiftId,
    name,
    email,
    captchaChallenge,
    session,
    isSignedInUser,
  });
  if (validationError) return validationError;

  // Signed-in users register for themselves: the order is issued immediately.
  // Guests stay pending until they confirm via the magic link.
  let order: string | undefined;
  let isAuthed = false;
  let userId: string | undefined;
  if (isSignedInUser) {
    isAuthed = !!session?.user?.id;
    userId = session?.user?.id;
    order = await IssueOrder(shiftId, name, email);
  }

  const person = await personInit(req, userId, name, email, phone);

  const entry = await CreateShiftEntry(
    shiftId,
    person.id,
    name,
    order ?? null,
    notes ?? "",
    isAuthed,
  );

  if (isSignedInUser) {
    await sendShiftEntryConfirmation(entry, person);
  }

  return NextResponse.json(entry, { status: 201 });
}

// Runs every sign-up gate in order and returns the first failure, or undefined
// when the sign-up is allowed. Each gate is a small, self-describing step:
//   1. slots not full
//   2. name + email present
//   3. captcha (guests only)
//   4. internal shifts blocked for non-internal users
//   5. authorization-locked kinds require the shift-access token
async function validateSignUp(args: {
  shiftId: number;
  name: string;
  email: string;
  captchaChallenge: string;
  session: Session | null;
  isSignedInUser: boolean;
}): Promise<NextResponse | undefined> {
  const { shiftId, name, email, captchaChallenge, session, isSignedInUser } =
    args;

  // 1. Slots must still be available.
  const slotsError = await validateSlotsFull(shiftId);
  if (slotsError) return slotsError;

  // 2. Name and email are mandatory.
  const detailsError = validateContactDetails(name, email);
  if (detailsError) return detailsError;

  // 3. Guests (not registering as themselves) must pass the captcha.
  if (!isSignedInUser) {
    const captchaError = await validateCaptcha(captchaChallenge);
    if (captchaError) return captchaError;
  }

  const shift = await GetShiftById(shiftId);
  const kind = await GetShiftKindById(shift.shiftKind);

  // 4. Authorization-locked kinds require the matching shift-access token.
  const authorizedError =  await validateAuthorizedShift(kind);
    if (authorizedError) return  authorizedError;

  // 5. Internal shifts are only open to internal users.
  return validateInternalShift(shift, session);
}

function validateContactDetails(
  name: string,
  email: string,
): NextResponse | undefined {
  if (!email || !name) {
    return NextResponse.json(
      { error: "Email and Name required" },
      { status: 400 },
    );
  }
  return undefined;
}

async function validateCaptcha(
  captchaChallenge: string,
): Promise<NextResponse | undefined> {
  const ok = await ValidateTurnstile(captchaChallenge);
  if (!ok.success) {
    return NextResponse.json(
      "Supplied Captcha was not valid. Please try again." + ok["error-codes"],
      { status: 403 },
    );
  }
  return undefined;
}

function validateInternalShift(
  shift: Shift,
  session: Session | null,
): NextResponse | undefined {
  if (shift.internal && !isInternalUser(session)) {
    return NextResponse.json(
      { error: "You cannot register for this shift" },
      { status: 403 },
    );
  }
  return undefined;
}

// Mirrors the authorized_shifts grant: a kind carrying an authorizationMessage
// is locked, and signing up requires the shift-access cookie to hold the kind's
// current magic-link token. Independent of being logged in.
async function validateAuthorizedShift(
  kind: ShiftKind,
): Promise<NextResponse | undefined> {
  if (!kind.authorizationMessage) return undefined;
  const access = await readShiftAccess();
  if (
    !kind.authorizationMagicLinkToken ||
    access[kind.id] !== kind.authorizationMagicLinkToken
  ) {
    return NextResponse.json(
      { error: "This shift requires authorization" },
      { status: 403 },
    );
  }
  return undefined;
}

async function validateSlotsFull(
  shiftId: number,
): Promise<NextResponse | undefined> {
  const entryCount = await db
    .selectFrom("shiftEntry")
    .select(db.fn.countAll().as("count"))
    .where("shift", "=", shiftId)
    .executeTakeFirst();
  const shiftSlots = await db
    .selectFrom("shift")
    .select("slots")
    .where("id", "=", shiftId)
    .executeTakeFirst();
  if (
    shiftSlots?.slots == undefined ||
    (Number(entryCount?.count) ?? 0) >= shiftSlots?.slots
  ) {
    return NextResponse.json({ error: "No Slots left" }, { status: 400 });
  }
  return undefined;
}

async function sendShiftEntryConfirmation(
  entry: ShiftEntry,
  person: Person,
): Promise<void> {
  const shift = await GetShiftById(entry.shift);
  const shiftKind = await GetShiftKindById(shift.shiftKind);
  const event = await GetEvent(shiftKind.eventId);
  if (!event) return;
  const eventDay = shift.eventDayId
    ? await GetEventDay(shift.eventDayId)
    : null;
  await sendShiftEntryEmail({
    entry,
    person,
    shift,
    shiftKind,
    event,
    eventDay,
  });
}

async function personInit(
  req: Request,
  id: string | undefined,
  name: string,
  email: string,
  phone: string,
): Promise<Person> {
  if (id) {
    // User that already has an authenticated session. The form still carries a
    // phone field, so store what they typed — otherwise a signed-in sign-up
    // leaves the account without the number the dashboard shows to admins.
    const person = await GetPersonBySub(id);
    if (!person) throw new Error(`No person found for sub: ${id}`);
    return await UpdatePersonPhone(person, phone);
  }
  const p = await FindOrCreatePersonByEmail(email, name ?? "", phone ?? null);
  const referer = req.headers.get("referer");
  const redirectPath = referer ? new URL(referer).pathname : undefined;
  await sendMagicLink(email, p.loginToken!, redirectPath);
  return p;
}
