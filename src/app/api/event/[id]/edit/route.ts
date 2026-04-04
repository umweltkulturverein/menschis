import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireInternalUser } from "@/lib/permissions";
import { db } from "@/db";
import { sql } from "kysely";
import { GetEntriesByShifts, GetShiftsByEvent } from "@/lib/db/shifts";
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
        const shifts = await GetShiftsByEvent(Number(id));

        const shiftIds = shifts.map((s) => s.id);
        const conflictingEntries = entries.filter((entry) =>
            shiftIds.includes(entry.shift),
        );
        if (conflictingEntries.length > 0) {
            return NextResponse.json(
                {
                    error: "There are still shiftentries related to this Day",
                },
                { status: 400 },
            );
        }
    }

    return NextResponse.json({ ok: true });
}
