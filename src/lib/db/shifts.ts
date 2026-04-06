import { db } from "@/db";
import type {
    ShiftKind,
    NewShiftKind,
    Shift,
    NewShift,
    ShiftEntry,
} from "@/types/shift";
import { NextResponse } from "next/server";

export async function DeleteShiftById(id: number) {
    await db.deleteFrom("shift").where("id", "=", id).execute();
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

export async function GetShiftsByEvent(
    eventId: number,
    eventDay?: string,
    authError?: NextResponse<unknown> | null,
): Promise<Shift[]> {
    let query = db
        .selectFrom("shift")
        .innerJoin("shiftKind", "shiftKind.id", "shift.shiftKind")
        .where("shiftKind.eventId", "=", eventId)
        .orderBy("eventDay")
        .orderBy("startDatetime")
        .selectAll("shift");

    if (eventDay !== undefined && eventDay !== "") {
        query = query.where("shift.eventDay", "=", eventDay);
        console.log("eventDay " + eventDay);
    }
    if (authError) query = query.where("shift.internal", "=", false);

    return await query.execute();
}

export async function CreateShiftKind(kind: NewShiftKind): Promise<ShiftKind> {
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

export async function CreateShiftEntry(
    shiftId: number,
    personId: number,
    name: string,
    notes: string,
    authError: NextResponse<unknown> | null,
): Promise<ShiftEntry | null> {
    const now = new Date();

    // non-internal users cannot entry in internal shifts
    if (authError) {
        const internal = await db
            .selectFrom("shift")
            .select("internal")
            .where("id", "=", shiftId)
            .execute();
        if (internal) {
            return null;
        }
    }
    return await db
        .insertInto("shiftEntry")
        .values({
            shift: shiftId,
            person: personId,
            name,
            notes,
            createdAt: now,
            updatedAt: now,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
}

export async function GetEntriesByShifts(
    shiftIds: number[],
): Promise<ShiftEntry[]> {
    if (shiftIds.length === 0) return [];
    return await db
        .selectFrom("shiftEntry")
        .selectAll()
        .where("shift", "in", shiftIds)
        .execute();
}

export async function GetPersonBySub(
    sub: string,
): Promise<{ id: number } | undefined> {
    return await db
        .selectFrom("person")
        .select("id")
        .where("sub", "=", sub)
        .executeTakeFirst();
}
