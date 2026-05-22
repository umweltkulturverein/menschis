import { EventItemTable } from "@/types/event";
import { EventDayTable } from "@/types/eventDay";
import { ShiftKindTable, ShiftTable, ShiftEntryTable } from "@/types/shift";
import { PersonTable } from "@/types/user";

export interface Database {
    event: EventItemTable;
    eventDays: EventDayTable;
    shiftKind: ShiftKindTable;
    shift: ShiftTable;
    shiftEntry: ShiftEntryTable;
    person: PersonTable;
}
