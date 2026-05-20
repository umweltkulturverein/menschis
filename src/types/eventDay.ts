import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface EventDayTable {
    id: Generated<number>;
    eventId: number;
    dayTitle: string;
    startDate: Date | null;
    shopItemId: string | null;
}

export type EventDay = Selectable<EventDayTable>;
export type NewEventDay = Insertable<EventDayTable>;
export type UpdateEventDay = Updateable<EventDayTable>;
