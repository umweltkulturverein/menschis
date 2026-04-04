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
    eventDay: string;
}

export type Shift = Selectable<ShiftTable>;
export type NewShift = Insertable<ShiftTable>;
export type UpdateShift = Updateable<ShiftTable>;

export interface ShiftEntryTable {
    id: Generated<number>;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    notes: string;
    shift: number;
    person: number | null;
}
export type ShiftEntry = Selectable<ShiftEntryTable>;
export type NewShiftEntry = Insertable<ShiftEntryTable>;
export type UpdateShiftEntry = Updateable<ShiftEntryTable>;
