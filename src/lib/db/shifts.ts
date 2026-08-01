import { db } from "@/db";
import type {
    Shift,
    NewShift,
    UpdateShift,
    ShiftKind,
    NewShiftKind,
} from "@/types/shift";
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
        if (filters.openOnly) {
            query = query.where((eb) =>
                eb(
                    eb.selectFrom("shiftEntry")
                        .select(eb.fn.countAll().as("c"))
                        .whereRef("shiftEntry.shift", "=", "shift.id"),
                    "<",
                    eb.ref("shift.slots"),
                ),
            );
        }
        // Only narrows; the authError gate above still applies for outsiders.
        if (filters.internalOnly && !authError) {
            query = query.where("shift.internal", "=", true);
        }
        if (filters.restrictedOnly) {
            query = query.where(
                "shiftKind.authorizationMessage",
                "is not",
                null,
            );
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
): Promise<{ startDatetime: Date; eventDayId: number | null }[]> {
    let query = db
        .selectFrom("shift")
        .innerJoin("shiftKind", "shiftKind.id", "shift.shiftKind")
        .where("shiftKind.eventId", "=", eventId)
        .select(["shift.startDatetime", "shift.eventDayId"]);

    if (authError) query = query.where("shift.internal", "=", false);

    return await query.execute();
}

/** Headline counts for the admin dashboard, across the whole event. Deliberately
 *  ignores the filter bar: these are the totals for the event, not for whatever
 *  slice is currently on screen. */
export interface EventShiftStats {
    /** Every slot the event offers, summed over all shifts. */
    slots: number;
    booked: number;
    checkedIn: number;
    unverified: number;
}

export async function GetEventShiftStats(
    eventId: number,
): Promise<EventShiftStats> {
    const [shifts, entries] = await Promise.all([
        db
            .selectFrom("shift")
            .innerJoin("shiftKind", "shiftKind.id", "shift.shiftKind")
            .where("shiftKind.eventId", "=", eventId)
            .select((eb) => eb.fn.sum<number>("shift.slots").as("slots"))
            .executeTakeFirst(),
        db
            .selectFrom("shiftEntry")
            .innerJoin("shift", "shift.id", "shiftEntry.shift")
            .innerJoin("shiftKind", "shiftKind.id", "shift.shiftKind")
            .where("shiftKind.eventId", "=", eventId)
            .select((eb) => [
                eb.fn.countAll<number>().as("booked"),
                eb.fn
                    .countAll<number>()
                    .filterWhere("shiftEntry.checkedInAt", "is not", null)
                    .as("checkedIn"),
                eb.fn
                    .countAll<number>()
                    .filterWhere("shiftEntry.verified", "=", false)
                    .as("unverified"),
            ])
            .executeTakeFirst(),
    ]);

    // sum() is null when the event has no shifts at all.
    return {
        slots: Number(shifts?.slots ?? 0),
        booked: Number(entries?.booked ?? 0),
        checkedIn: Number(entries?.checkedIn ?? 0),
        unverified: Number(entries?.unverified ?? 0),
    };
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

export async function UpdateShiftById(
    id: number,
    shift: UpdateShift,
): Promise<Shift> {
    return await db
        .updateTable("shift")
        .set(shift)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow();
}
