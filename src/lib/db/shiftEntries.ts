import { ShiftEntry, ShiftEntryWithPerson, UpdateShiftEntry } from "@/types/shift";
import { db } from "@/db";

// Time an anonymous sign-up has to be confirmed (via first login) before it is
// cancelled and removed by the expiry sweeper.
export const VERIFY_WINDOW_MS = 2 * 60 * 60 * 1000;

export async function DeleteShiftEntry(
    entryId: number,
    personId: number | null,
): Promise<void> {
    let query = db.deleteFrom("shiftEntry").where("id", "=", entryId);
    if (personId !== null) query = query.where("person", "=", personId);
    await query.execute();
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
    verified: boolean,
): Promise<ShiftEntry> {
    const now = new Date();

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
        // Checkin is a thing only admins can do, so they overrule the cleaning.
        .where("shiftEntry.checkedInAt", "is", null)
        .select([
            "shiftEntry.id as id",
            "shiftEntry.order as order",
            "event.shopEventId as shopEventId",
        ])
        .execute();
}

export async function GetShiftEntry(
    entryId: number,
    personId: number | null,
): Promise<ShiftEntry | undefined> {
    let query = db
        .selectFrom("shiftEntry")
        .selectAll()
        .where("id", "=", entryId);
    if (personId !== null) query = query.where("person", "=", personId);
    return await query.executeTakeFirst();
}

export async function UpdateShiftEntryRow(
    entryId: number,
    personId: number | null,
    patch: UpdateShiftEntry,
): Promise<ShiftEntry | undefined> {
    patch.updatedAt = new Date();
    let query = db
        .updateTable("shiftEntry")
        .set(patch)
        .where("id", "=", entryId);
    if (personId !== null) query = query.where("person", "=", personId);
    return await query.returningAll().executeTakeFirst();
}

export async function UpdateShiftEntryAdminFields(
    entryId: number,
    patch: Pick<UpdateShiftEntry, "checkedInAt" | "adminNote" | "verified">,
): Promise<ShiftEntry | undefined> {
    return await db
        .updateTable("shiftEntry")
        .set({ ...patch, updatedAt: new Date() })
        .where("id", "=", entryId)
        .returningAll()
        .executeTakeFirst();
}

export async function GetShiftEntriesByShifts(
    shiftIds: number[],
): Promise<ShiftEntry[]> {
    if (shiftIds.length === 0) return [];

    return await db
        .selectFrom("shiftEntry")
        .selectAll()
        .where("shift", "in", shiftIds)
        .execute();
}

export async function GetShiftEntriesWithPersonByShifts(
    shiftIds: number[],
): Promise<ShiftEntryWithPerson[]> {
    if (shiftIds.length === 0) return [];

    return await db
        .selectFrom("shiftEntry")
        .innerJoin("person", "person.id", "shiftEntry.person")
        .where("shiftEntry.shift", "in", shiftIds)
        .selectAll("shiftEntry")
        .select([
            "person.email as personEmail",
            "person.phone as personPhone",
        ])
        .execute();
}