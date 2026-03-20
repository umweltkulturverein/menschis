import { EventItemTable } from "@/types/event";
import { ShiftKindTable, ShiftTable } from "@/types/shift";

export interface Database {
    event: EventItemTable;
    shiftKind: ShiftKindTable;
    shift: ShiftTable;
}
