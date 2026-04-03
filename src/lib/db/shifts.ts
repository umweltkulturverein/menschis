import { db } from "@/db";
import type { ShiftKind, NewShiftKind, Shift, NewShift, ShiftEntry } from "@/types/shift";

export async function GetShiftKindsByEvent(eventId: number): Promise<ShiftKind[]> {
    return await db
        .selectFrom("shiftKind")
        .selectAll()
        .where("eventId", "=", eventId)
        .execute();
}

export async function GetShiftsByEvent(eventId: number): Promise<Shift[]> {
    return await db
        .selectFrom("shift")
        .innerJoin("shiftKind", "shiftKind.id", "shift.shiftKind")
        .where("shiftKind.eventId", "=", eventId)
        .selectAll("shift")
        .execute();
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
    notes: string,
): Promise<ShiftEntry> {
    const now = new Date();
    return await db
        .insertInto("shiftEntry")
        .values({ shift: shiftId, person: personId, notes, createdAt: now, updatedAt: now })
        .returningAll()
        .executeTakeFirstOrThrow();
}
