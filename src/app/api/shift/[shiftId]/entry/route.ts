import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { CreateShiftEntry } from "@/lib/db/shiftEntries";
import { FindOrCreatePersonByEmail, GetPersonBySub } from "@/lib/db/persons";
import { sendMagicLink } from "@/lib/email/email";
import { NextResponse } from "next/server";
import { requireInternalUser } from "@/lib/permissions";
import {CreateOrder} from "@/lib/ticket/pretix";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ shiftId: string }> },
) {
    const session = await getServerSession(authOptions);
    const { name, email, phone, notes } = await req.json();
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

    const person: { id: number } = await personInit(req, session?.user?.id || undefined, name, email, phone)

    const authError = requireInternalUser(session);

    const order = await CreateOrder("T24", name, email, "1036653", "4944231")

    const entry = await CreateShiftEntry(
        shiftId,
        person.id,
        name,
        order,
        notes ?? "",
        authError,
    );

    if (entry == undefined)
        return NextResponse.json("You cannot Register for this shift", {
            status: 401,
        });
    return NextResponse.json(entry, { status: 201 });
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

async function personInit(req: Request,id: string | undefined, name: string, email:string, phone: string): Promise<{ id: number }> {
    if (id) { // User that already has an authenticated session
        const person = await GetPersonBySub(id);
        if (!person) throw new Error(`No person found for sub: ${id}`);
        return { id: person.id };
    }
    const p = await FindOrCreatePersonByEmail(
        email,
        name ?? "",
        phone ?? null,
    );
    const referer = req.headers.get("referer");
    const redirectPath = referer ? new URL(referer).pathname : undefined;
    await sendMagicLink(email, p.loginToken!, redirectPath);
    return {id: p.id};
}