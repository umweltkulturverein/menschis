import { db } from "@/db";
import type {
    ShiftKind,
    NewShiftKind,
    Shift,
    NewShift,
    ShiftEntry,
} from "@/types/shift";

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
): Promise<ShiftEntry> {
    const now = new Date();
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
