import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { db } from "@/db";
import { CreateShiftEntry } from "@/lib/db/shiftEntries";
import { FindOrCreatePersonByEmail, GetPersonBySub, type Person } from "@/lib/db/persons";
import { sendMagicLink, sendShiftEntryEmail } from "@/lib/email/email";
import { NextResponse } from "next/server";
import { requireInternalUser } from "@/lib/permissions";
import {CreateOrder} from "@/lib/ticket/pretix";
import { GetEventDay } from "@/lib/db/eventDays";
import { GetEvent } from "@/lib/db/events";
import { GetShiftById } from "@/lib/db/shifts";
import { GetShiftKindById } from "@/lib/db/shiftKinds";
import {IssueOrder} from "@/lib/ticket/main";
import type { ShiftEntry } from "@/types/shift";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ shiftId: string }> },
) {
    const session = await getServerSession(authOptions);
    const { name, email, phone, notes, captchaChallenge } = await req.json();
    const { shiftId: shiftIdParam } = await params;
    const shiftId = parseInt(shiftIdParam);
    if (isNaN(shiftId)) {
        return NextResponse.json(
            { error: "Invalid shift ID" },
            { status: 400 },
        );
    }

    const slotsFull = await validateSlotsFull(shiftId);
    if (slotsFull !== undefined) {
        return slotsFull;
    }

    if (!email || !name) {
        return NextResponse.json({ error: "Email and Name required" }, { status: 400 });
    }
    const sessionEmail = session?.user?.email?.trim().toLowerCase();
    const formEmail = email?.trim().toLowerCase();
    const isSignedInUser = !!sessionEmail && sessionEmail === formEmail;

    let order, isAuthed, userId = undefined;
    // user creates shift for himself. no need to verify the shift or create the person. order for unregistered shifts is done after verified
    if (isSignedInUser) {
         isAuthed = !!session?.user?.id;
         userId = session?.user?.id
         order = await IssueOrder(shiftId, name, email);
    } else {
        const ok = await ValidateTurnstile(captchaChallenge)
        if (!ok.success) {
            return NextResponse.json("Supplied Captcha was not valid. Please try again." + ok["error-codes"], {
                status: 403,
            });
        }
    }


    const person = await personInit(req, userId, name, email, phone)

    const authError = requireInternalUser(session);



    const entry = await CreateShiftEntry(
        shiftId,
        person.id,
        name,
        order ?? null,
        notes ?? "",
        authError,
        isAuthed ?? false,
    );

    if (entry == undefined)
        return NextResponse.json("You cannot Register for this shift", {
            status: 401,
        });
    if (isSignedInUser) {
        await sendShiftEntryConfirmation(entry, person);
    }


    return NextResponse.json(entry, { status: 201 });
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
    await sendShiftEntryEmail({ entry, person, shift, shiftKind, event, eventDay });
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

async function personInit(req: Request,id: string | undefined, name: string, email:string, phone: string): Promise<Person> {
    if (id) { // User that already has an authenticated session
        const person = await GetPersonBySub(id);
        if (!person) throw new Error(`No person found for sub: ${id}`);
        return person;
    }
    const p = await FindOrCreatePersonByEmail(
        email,
        name ?? "",
        phone ?? null,
    );
    const referer = req.headers.get("referer");
    const redirectPath = referer ? new URL(referer).pathname : undefined;
    await sendMagicLink(email, p.loginToken!, redirectPath);
    return p;
}