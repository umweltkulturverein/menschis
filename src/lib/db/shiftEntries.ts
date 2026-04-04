import { ShiftEntry } from "@/types/shift";
import { db } from "@/db";

export async function GetEntriesByEvent(
    eventId: number,
): Promise<ShiftEntry[]> {
    return await db
        .selectFrom("shiftEntry")
        .innerJoin("shift", "shift.id", "shiftEntry.shift")
        .innerJoin("shiftKind", "shiftKind.id", "shift.shiftKind")
        .where("shiftKind.eventId", "=", eventId)
        .selectAll("shiftEntry")
        .execute();
}

export async function DeleteShiftEntry(
    entryId: number,
    personId: number,
): Promise<void> {
    await db
        .deleteFrom("shiftEntry")
        .where("id", "=", entryId)
        .where("person", "=", personId)
        .execute();
}

export async function UpdateShiftEntry(
    entryId: number,
    personId: number,
    name: string,
    notes: string,
): Promise<ShiftEntry | undefined> {
    return await db
        .updateTable("shiftEntry")
        .set({ name, notes, updatedAt: new Date() })
        .where("id", "=", entryId)
        .where("person", "=", personId)
        .returningAll()
        .executeTakeFirst();
}
