import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface EventItemTable {
    id: Generated<number>;
    title: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    startBookingDateTime: Date;
    public: boolean;
    location: string;
    days: string[] | null; // YYYY-MM-DD date strings
}
export type EventItem = Selectable<EventItemTable>;
export type NewEventItem = Insertable<EventItemTable>;
export type UpdateEventItem = Updateable<EventItemTable>;
