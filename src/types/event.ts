import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  event: EventTable;
}

export interface EventTable {
  id: Generated<number>;
  title: string;
  desciption: string | null;
  startDate: Date;
  endDate: Date;
  startBookingDateTime: Date;
  Location: string;
}
export type Event = Selectable<EventTable>;
export type NewEvent = Insertable<EventTable>;
export type UpdateEvent = Updateable<EventTable>;
