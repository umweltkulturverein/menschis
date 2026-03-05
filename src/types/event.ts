import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
    event: EventTable;
}

export interface EventTable {
    id: Generated<number>;
    title: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    startBookingDateTime: Date;
    public: boolean;
    location: string;
}
export type Event = Selectable<EventTable>;
export type NewEvent = Insertable<EventTable>;
export type UpdateEvent = Updateable<EventTable>;
