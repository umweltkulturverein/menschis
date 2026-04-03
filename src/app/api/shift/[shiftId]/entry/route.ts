import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { CreateShiftEntry } from "@/lib/db/shifts";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: { shiftId: string } },
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shiftId = parseInt(params.shiftId);
    if (isNaN(shiftId)) {
        return NextResponse.json({ error: "Invalid shift ID" }, { status: 400 });
    }

    const person = await db
        .selectFrom("person")
        .select("id")
        .where("sub", "=", session.user.id)
        .executeTakeFirst();

    if (!person) {
        return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    const { notes } = await req.json();
    const entry = await CreateShiftEntry(shiftId, person.id, notes ?? "");
    return NextResponse.json(entry, { status: 201 });
}
