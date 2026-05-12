import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import {DeleteShiftEntry, GetShiftEntry, UpdateShiftEntry} from "@/lib/db/shiftEntries";
import { NextResponse } from "next/server";
import {Person} from "@/lib/db/persons";
import {CancelOrder} from "@/lib/ticket/pretix";
import {GetEventByShiftEntryId, GetEventByShiftId} from "@/lib/db/events";

async function resolvePerson(sub: string): Promise<Person | null> {
    const person = await db
        .selectFrom("person")
        .selectAll()
        .where("sub", "=", sub)
        .executeTakeFirst();
    return person ?? null;
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ shiftId: string; entryId: string }> },
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { entryId: entryIdParam } = await params;
    const entryId = parseInt(entryIdParam);
    if (isNaN(entryId)) {
        return NextResponse.json(
            { error: "Invalid entry ID" },
            { status: 400 },
        );
    }

    const person = await resolvePerson(session.user.id);
    if (!person?.id) {
        return NextResponse.json(
            { error: "Person not found" },
            { status: 404 },
        );
    }
    const shiftentry = await GetShiftEntry(entryId, person.id);
    const event = await GetEventByShiftEntryId(entryId);

    if (shiftentry?.order) {
        const ok = await CancelOrder(event?.shopEventId, shiftentry?.order ?? "");
        if (!ok) {
            return new NextResponse("Error cancelling the Order", { status: 500 });
        }
    }
    await DeleteShiftEntry(entryId, person.id);
    return new NextResponse(null, { status: 204 });
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ shiftId: string; entryId: string }> },
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { entryId: entryIdParam } = await params;
    const entryId = parseInt(entryIdParam);
    if (isNaN(entryId)) {
        return NextResponse.json(
            { error: "Invalid entry ID" },
            { status: 400 },
        );
    }

    const person = await resolvePerson(session.user.id);
    if (!person?.id) {
        return NextResponse.json(
            { error: "Person not found" },
            { status: 404 },
        );
    }

    const { name, notes } = await req.json();
    const updated = await UpdateShiftEntry(
        entryId,
        person.id,
        name ?? "",
        notes ?? "",
    );
    if (!updated) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
}
