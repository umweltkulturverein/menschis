import { db } from "@/db";
import type { Shift, NewShift, ShiftKind, NewShiftKind } from "@/types/shift";
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
