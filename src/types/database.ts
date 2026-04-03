import { EventItemTable } from "@/types/event";
import { ShiftKindTable, ShiftTable, ShiftEntryTable } from "@/types/shift";
import { PersonTable } from "@/types/user";

export interface Database {
    event: EventItemTable;
    shiftKind: ShiftKindTable;
    shift: ShiftTable;
    shiftEntry: ShiftEntryTable;
    person: PersonTable;
}
