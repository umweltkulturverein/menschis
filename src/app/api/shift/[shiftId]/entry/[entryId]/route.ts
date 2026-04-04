import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { DeleteShiftEntry, UpdateShiftEntry } from "@/lib/db/shiftEntries";
import { NextResponse } from "next/server";

async function resolvePersonId(sub: string): Promise<number | null> {
    const person = await db
        .selectFrom("person")
        .select("id")
        .where("sub", "=", sub)
        .executeTakeFirst();
    return person?.id ?? null;
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

    const personId = await resolvePersonId(session.user.id);
    if (!personId) {
        return NextResponse.json(
            { error: "Person not found" },
            { status: 404 },
        );
    }

    await DeleteShiftEntry(entryId, personId);
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

    const personId = await resolvePersonId(session.user.id);
    if (!personId) {
        return NextResponse.json(
            { error: "Person not found" },
            { status: 404 },
        );
    }

    const { name, notes } = await req.json();
    const updated = await UpdateShiftEntry(
        entryId,
        personId,
        name ?? "",
        notes ?? "",
    );
    if (!updated) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
}
