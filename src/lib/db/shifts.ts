import { db } from "@/db";
import type { Shift, NewShift, ShiftKind, NewShiftKind } from "@/types/shift";
import type { ShiftFilters } from "@/lib/shifts/filters";
import { NextResponse } from "next/server";

export async function DeleteShiftById(id: number) {
    await db.deleteFrom("shift").where("id", "=", id).execute();
}

export async function GetShiftById(id: number): Promise<Shift> {
    return await db.selectFrom("shift").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function GetShiftsByEvent(
    eventId: number,
    eventDayId?: number,
    authError?: NextResponse<unknown> | null,
    filters?: ShiftFilters,
): Promise<Shift[]> {
    let query = db
        .selectFrom("shift")
        .innerJoin("shiftKind", "shiftKind.id", "shift.shiftKind")
        .where("shiftKind.eventId", "=", eventId)
        .orderBy("eventDayId")
        .orderBy("startDatetime")
        .selectAll("shift");

    if (eventDayId !== undefined) {
        query = query.where("shift.eventDayId", "=", eventDayId);
    }
    // Authorization gate: non-internal users never receive internal shifts,
    // regardless of any filter they request below.
    if (authError) query = query.where("shift.internal", "=", false);

    if (filters) {
        if (filters.kindIds.length) {
            query = query.where("shift.shiftKind", "in", filters.kindIds);
        }
        // Only narrows; the authError gate above still applies for outsiders.
        if (filters.internalOnly && !authError) {
            query = query.where("shift.internal", "=", true);
        }
        // The time-of-day window is applied in JS (see shiftInTimeWindow), since
        // it aggregates across days and must unwrap past midnight.
    }

    return await query.execute();
}

/** Start/end timestamps for every shift a viewer may see — feeds the
 *  time-of-day axis of the slider. */
export async function GetShiftDatetimesByEvent(
    eventId: number,
    authError?: NextResponse<unknown> | null,
): Promise<{ startDatetime: Date; endDatetime: Date }[]> {
    let query = db
        .selectFrom("shift")
        .innerJoin("shiftKind", "shiftKind.id", "shift.shiftKind")
        .where("shiftKind.eventId", "=", eventId)
        .select(["shift.startDatetime", "shift.endDatetime"]);

    if (authError) query = query.where("shift.internal", "=", false);

    return await query.execute();
}

export async function GetShiftKindsByEvent(
    eventId: number,
): Promise<ShiftKind[]> {
    return await db
        .selectFrom("shiftKind")
        .selectAll()
        .where("eventId", "=", eventId)
        .execute();
}

export async function CreateShiftKind(
    kind: NewShiftKind,
): Promise<ShiftKind> {
    return await db
        .insertInto("shiftKind")
        .values(kind)
        .returningAll()
        .executeTakeFirstOrThrow();
}

export async function CreateShift(shift: NewShift): Promise<Shift> {
    return await db
        .insertInto("shift")
        .values(shift)
        .returningAll()
        .executeTakeFirstOrThrow();
}
