import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface ShiftKindTable {
    id: Generated<number>;
    eventId: number;
    title: string;
    description: string | null;
    icon: string | null;
    color: string;
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

// Only the fields the owner may see on the client
export type OwnShiftEntry = Pick<ShiftEntry, "id" | "name" | "notes" | "person">;
// What other users' entries expose to the client: just that a slot is taken
export type PublicShiftEntry = { id: number };
export type ClientShiftEntry = OwnShiftEntry | PublicShiftEntry;

export function isOwnEntry(entry: ClientShiftEntry): entry is OwnShiftEntry {
    return "name" in entry;
}
