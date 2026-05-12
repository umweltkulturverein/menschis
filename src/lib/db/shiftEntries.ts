import { ShiftEntry } from "@/types/shift";
import { db } from "@/db";
import { NextResponse } from "next/server";

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

export async function CreateShiftEntry(
    shiftId: number,
    personId: number,
    name: string,
    order: string,
    notes: string,
    authError: NextResponse<unknown> | null,
): Promise<ShiftEntry | undefined> {
    const now = new Date();

    if (authError) {
        // check if user tries to entry into internal shift even tho user is not internal
        const internal = await db
            .selectFrom("shift")
            .select("internal")
            .where("id", "=", shiftId)
            .execute();
        if (internal[0].internal) {
            return undefined;
        }
    }
    return await db
        .insertInto("shiftEntry")
        .values({
            shift: shiftId,
            person: personId,
            name,
            order,
            notes,
            createdAt: now,
            updatedAt: now,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
}

export async function GetShiftEntry(
    entryId: number,
    personId: number,
): Promise<ShiftEntry | undefined> {
    return await db
        .selectFrom("shiftEntry")
        .selectAll()
        .where("id", "=", entryId)
        .where("person", "=", personId)
        .executeTakeFirst();
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