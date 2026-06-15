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
}
export type ShiftEntry = Selectable<ShiftEntryTable>;
export type NewShiftEntry = Insertable<ShiftEntryTable>;
export type UpdateShiftEntry = Updateable<ShiftEntryTable>;

// Only the fields the owner may see/edit on their own entry
export type OwnShiftEntry = Pick<ShiftEntry, "id" | "name" | "notes" | "person">;
// Internal viewers see a co-worker's name and notes on internal shifts, read-only
export type NamedShiftEntry = { id: number; name: string; notes: string };
// What other users' entries expose to the client: just that a slot is taken
export type PublicShiftEntry = { id: number };
export type ClientShiftEntry =
    | OwnShiftEntry
    | NamedShiftEntry
    | PublicShiftEntry;

/** The viewer's own entry — the only one that is editable (carries `person`). */
export function isOwnEntry(entry: ClientShiftEntry): entry is OwnShiftEntry {
    return "person" in entry;
}

/** Name to display for an entry, when one is visible to the viewer. */
export function entryName(entry: ClientShiftEntry): string | null {
    return "name" in entry ? entry.name : null;
}

/** Notes to display for an entry, when visible to the viewer. */
export function entryNotes(entry: ClientShiftEntry): string | null {
    return "notes" in entry ? entry.notes : null;
}
