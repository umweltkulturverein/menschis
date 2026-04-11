import { db } from "@/db";
import type { Shift, NewShift } from "@/types/shift";
import { NextResponse } from "next/server";

export async function DeleteShiftById(id: number) {
    await db.deleteFrom("shift").where("id", "=", id).execute();
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

export async function CreateShift(shift: NewShift): Promise<Shift> {
    return await db
        .insertInto("shift")
        .values(shift)
        .returningAll()
        .executeTakeFirstOrThrow();
}
