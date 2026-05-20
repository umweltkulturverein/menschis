import { db } from "@/db";
import type { EventDay, NewEventDay, UpdateEventDay } from "@/types/eventDay";

export async function GetEventDays(eventId: number): Promise<EventDay[]> {
    return await db
        .selectFrom("eventDays")
        .selectAll()
        .where("eventId", "=", eventId)
        .orderBy("startDate")
        .orderBy("id")
        .execute();
}

export async function GetEventDay(id: number): Promise<EventDay | undefined> {
    return await db
        .selectFrom("eventDays")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirst();
}

export async function CreateEventDay(day: NewEventDay): Promise<EventDay> {
    return await db
        .insertInto("eventDays")
        .values(day)
        .returningAll()
        .executeTakeFirstOrThrow();
}

export async function UpdateEventDayRow(
    id: number,
    eventId: number,
    patch: UpdateEventDay,
): Promise<EventDay | undefined> {
    return await db
        .updateTable("eventDays")
        .set(patch)
        .where("id", "=", id)
        .where("eventId", "=", eventId)
        .returningAll()
        .executeTakeFirst();
}

export async function DeleteEventDay(
    id: number,
    eventId: number,
): Promise<void> {
    await db
        .deleteFrom("eventDays")
        .where("id", "=", id)
        .where("eventId", "=", eventId)
        .execute();
}
