import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireInternalUser } from "@/lib/permissions";
import { db } from "@/db";
import { sql } from "kysely";
import { GetEntriesByShifts } from "@/lib/db/shifts";
import { GetEntriesByEvent } from "@/lib/db/shiftEntries";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getServerSession(authOptions);
    const authError = requireInternalUser(session);
    if (authError) return authError;

    const { id } = await params;
    const body = await req.json();

    if (Array.isArray(body.days)) {
        await db
            .updateTable("event")
            .set({ days: sql`${JSON.stringify(body.days)}::jsonb` })
            .where("id", "=", Number(id))
            .execute();
        const entries = await GetEntriesByEvent(Number(id));
        for (const e of entries) {
            if (JSON.stringify(body.days).includes(e)) {
                NextResponse.json(
                    {
                        error: "There are still shiftentries related to this Day",
                    },
                    { status: 400 },
                );
            }
        }
        await deleteShiftsNotInDays(Number(id), body.days);
    }

    return NextResponse.json({ ok: true });
}

async function deleteShiftsNotInDays(
    eventId: number,
    remainingDays: string[],
): Promise<void> {
    let query = db
        .deleteFrom("shift")
        .where(
            "shift.id",
            "in",
            db
                .selectFrom("shift as s")
                .innerJoin("shiftKind", "shiftKind.id", "s.shiftKind")
                .where("shiftKind.eventId", "=", eventId)
                .select("s.id"),
        );

    if (remainingDays.length > 0) {
        query = query.where("shift.eventDay", "not in", remainingDays);
    }

    await query.execute();
}
