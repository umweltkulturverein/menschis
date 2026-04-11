import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { CreateShiftEntry } from "@/lib/db/shiftEntries";
import { FindOrCreatePersonByEmail, GetPersonBySub } from "@/lib/db/persons";
import { sendMagicLink } from "@/lib/email";
import { NextResponse } from "next/server";
import { requireInternalUser } from "@/lib/permissions";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ shiftId: string }> },
) {
    const session = await getServerSession(authOptions);

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

    const { name, email, phone, notes } = await req.json();

    if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    let person: { id: number };

    if (session?.user?.id) {
        const p = await GetPersonBySub(session.user.id);
        if (!p) {
            return NextResponse.json(
                { error: "Person not found" },
                { status: 404 },
            );
        }
        person = p;
    } else {
        const p = await FindOrCreatePersonByEmail(
            email,
            name ?? "",
            phone ?? null,
        );
        const referer = req.headers.get("referer");
        const redirectPath = referer ? new URL(referer).pathname : undefined;
        await sendMagicLink(email, p.loginToken!, redirectPath);
        person = p;
    }
    const authError = requireInternalUser(session);
    const entry = await CreateShiftEntry(
        shiftId,
        person.id,
        name ?? "",
        notes ?? "",
        authError,
    );
    console.log(entry);
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
