import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface EventItemTable {
    id: Generated<number>;
    title: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    startBookingDateTime: Date;
    public: boolean;
    shopEventId?: string;
    location: string;
    backstageAccess: boolean;
    tokenCount: number;
    infoText: string | null;
}
export type EventItem = Selectable<EventItemTable>;
export type NewEventItem = Insertable<EventItemTable>;
export type UpdateEventItem = Updateable<EventItemTable>;
