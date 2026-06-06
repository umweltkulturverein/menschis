import {Shift, ShiftEntry, UpdateShiftEntry} from "@/types/shift";
import { db } from "@/db";
import { NextResponse } from "next/server";
import ShiftEntries from "@/components/Shifts/Entry/ShiftEntries";

// Time an anonymous sign-up has to be confirmed (via first login) before it is
// cancelled and removed by the expiry sweeper.
export const VERIFY_WINDOW_MS = 2 * 60 * 60 * 1000;

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

export async function DeleteShiftEntryById(entryId: number): Promise<void> {
    await db.deleteFrom("shiftEntry").where("id", "=", entryId).execute();
}

export async function CreateShiftEntry(
    shiftId: number,
    personId: number,
    name: string,
    order: string | null,
    notes: string,
    authError: NextResponse<unknown> | null,
    verified: boolean,
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
            order: order ?? null,
            notes,
            verified,
            createdAt: now,
            updatedAt: now,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
}

// A pending sign-up shown to its owner in the confirmation pop-up.
export interface PendingEntryView {
    id: number;
    shiftId: number;
    shiftKindTitle: string;
    eventTitle: string;
    startDatetime: Date;
    endDatetime: Date;
    createdAt: Date;
}

export async function GetPendingEntriesByPerson(
    personId: number,
): Promise<PendingEntryView[]> {
    return await db
        .selectFrom("shiftEntry")
        .innerJoin("shift", "shift.id", "shiftEntry.shift")
        .innerJoin("shiftKind", "shiftKind.id", "shift.shiftKind")
        .innerJoin("event", "event.id", "shiftKind.eventId")
        .where("shiftEntry.person", "=", personId)
        .where("shiftEntry.verified", "=", false)
        .orderBy("shift.startDatetime")
        .select([
            "shiftEntry.id as id",
            "shiftEntry.shift as shiftId",
            "shiftEntry.createdAt as createdAt",
            "shiftKind.title as shiftKindTitle",
            "event.title as eventTitle",
            "shift.startDatetime as startDatetime",
            "shift.endDatetime as endDatetime",
        ])
        .execute();
}

// Confirm every pending sign-up of a person. Called when the owner accepts the
// pop-up after proving identity (magic-link or SSO login). Returns the count.
export async function ConfirmPendingEntriesByPerson(
    personId: number,
): Promise<ShiftEntry[]> {
    return await db
        .updateTable("shiftEntry")
        .set({ verified: true, updatedAt: new Date() })
        .where("person", "=", personId)
        .where("verified", "=", false)
        .returningAll()
        .execute();
}

// An expired, unconfirmed sign-up the sweeper must cancel and delete.
export interface ExpiredPendingEntry {
    id: number;
    order: string | null;
    shopEventId: string | undefined;
}

export async function GetExpiredPendingEntries(
    cutoff: Date,
): Promise<ExpiredPendingEntry[]> {
    return await db
        .selectFrom("shiftEntry")
        .innerJoin("shift", "shift.id", "shiftEntry.shift")
        .innerJoin("shiftKind", "shiftKind.id", "shift.shiftKind")
        .innerJoin("event", "event.id", "shiftKind.eventId")
        .where("shiftEntry.verified", "=", false)
        .where("shiftEntry.createdAt", "<", cutoff)
        .select([
            "shiftEntry.id as id",
            "shiftEntry.order as order",
            "event.shopEventId as shopEventId",
        ])
        .execute();
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



export async function UpdateShiftEntryRow(
    entryId: number,
    personId: number,
    patch: UpdateShiftEntry,
): Promise<ShiftEntry | undefined> {
    patch.updatedAt = new Date();
    return await db
        .updateTable("shiftEntry")
        .set(patch)
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