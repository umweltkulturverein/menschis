import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface ShiftKindTable {
    id: Generated<number>;
    eventId: number;
    title: string;
    description: string | null;
    icon: string | null;
    color: string;
    allAccess: boolean;
    authorizationMessage: string | null;
    authorizationMagicLinkToken: string | null;
}

export type ShiftKind = Selectable<ShiftKindTable>;
export type NewShiftKind = Insertable<ShiftKindTable>;
export type UpdateShiftKind = Updateable<ShiftKindTable>;

export interface ShiftTable {
    id: Generated<number>;
    startDatetime: Date;
    endDatetime: Date;
    internal: boolean;
    slots: number;
    shiftKind: number;
    eventDayId: number | null;
}

export type Shift = Selectable<ShiftTable>;
export type NewShift = Insertable<ShiftTable>;
export type UpdateShift = Updateable<ShiftTable>;

export interface ShiftEntryTable {
    id: Generated<number>;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    order: string | null;
    verified?: boolean;
    notes: string;
    shift: number;
    person: number;
    /** When an admin checked the person in on site; null = not checked in. */
    checkedInAt: Date | null;
    /** Free-text note only admins ever see. */
    adminNote: string | null;
}
export type ShiftEntry = Selectable<ShiftEntryTable>;
export type NewShiftEntry = Insertable<ShiftEntryTable>;
export type UpdateShiftEntry = Updateable<ShiftEntryTable>;

/** An entry joined with the account it belongs to. Only ever loaded for admins,
 *  who are the only viewers allowed to see the person behind an entry. */
export interface ShiftEntryWithPerson extends ShiftEntry {
    personEmail: string;
    personPhone: string | null;
}

// Only the fields the owner may see/edit on their own entry
export type OwnShiftEntry = Pick<ShiftEntry, "id" | "name" | "notes" | "person">;
// Internal viewers see a co-worker's name and notes on internal shifts, read-only
export type NamedShiftEntry = { id: number; name: string; notes: string };
// What other users' entries expose to the client: just that a slot is taken
export type PublicShiftEntry = { id: number };

/** if /dashboard as it is admin exclusive */
export type AdminEntryFields = {
    email: string;
    phone: string | null;
    /** Sign-up time, pre-formatted on the server so the client cannot drift. */
    signedUpAt: string;
    verified: boolean;
} & AdminEntryState;

/** The admin-writable half of an entry: what the dashboard can change and what
 *  the admin PATCH route echoes back. Kept apart from the read-only fields so
 *  both sides of that round-trip stay in step. */
export type AdminEntryState = {
    checkedIn: boolean;
    /** Check-in time, pre-formatted on the server; null when not checked in. */
    checkedInAt: string | null;
    adminNote: string;
};
/** Admins see every entry in full; `person` is still only set on their own,
 *  which keeps the edit/delete controls owner-bound. */
export type AdminShiftEntry = NamedShiftEntry &
    AdminEntryFields & { person?: number };

export type ClientShiftEntry =
    | OwnShiftEntry
    | NamedShiftEntry
    | PublicShiftEntry
    | AdminShiftEntry;

/** The viewer's own entry — the only one that is editable (carries `person`). */
export function isOwnEntry(entry: ClientShiftEntry): entry is OwnShiftEntry {
    return "person" in entry && typeof entry.person === "number";
}

/** Name to display for an entry, when one is visible to the viewer. */
export function entryName(entry: ClientShiftEntry): string | null {
    return "name" in entry ? entry.name : null;
}

/** Notes to display for an entry, when visible to the viewer. */
export function entryNotes(entry: ClientShiftEntry): string | null {
    return "notes" in entry ? entry.notes : null;
}

/** The admin-only fields of an entry, or null for every non-admin viewer. */
export function entryAdminFields(
    entry: ClientShiftEntry,
): AdminEntryFields | null {
    return "signedUpAt" in entry ? entry : null;
}
