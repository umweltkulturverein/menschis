import { db } from "@/db";
import type { EventItem, NewEventItem, UpdateEventItem } from "@/types/event";

export async function GetEvent(id: number): Promise<EventItem | undefined> {
    return await db
        .selectFrom("event")
        .selectAll()
        .where("id", "=", id)
        //        .where("public", "=", true)
        .executeTakeFirst();
}

export async function GetEventAdmin(
    id: number,
): Promise<EventItem | undefined> {
    return await db
        .selectFrom("event")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirst();
}

export async function GetEvents(): Promise<EventItem[] | undefined> {
    return await db
        .selectFrom("event")
        .selectAll()
        //  .where("public", "=", true)
        .execute();
}

export async function GetEventByShiftEntryId(
    shiftEntryId: number,
): Promise<EventItem | undefined> {
    return await db
        .selectFrom("event")
        .innerJoin("shiftKind", "shiftKind.eventId", "event.id")
        .innerJoin("shift", "shift.shiftKind", "shiftKind.id")
        .innerJoin("shiftEntry", "shiftEntry.shift", "shift.id")
        .selectAll("event")
        .where("shiftEntry.id", "=", shiftEntryId)
        .executeTakeFirst();
}

export async function CreateEvent(
    e: NewEventItem,
): Promise<EventItem | undefined> {
    const event = await db
        .insertInto("event")
        .values(e)
        .returningAll()
        .executeTakeFirstOrThrow();
    return event;
}

export async function UpdateEvent(
    id: number,
    patch: UpdateEventItem,
): Promise<EventItem | undefined> {
    return await db
        .updateTable("event")
        .set(patch)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirst();
}

export async function DeleteEvent(id: number): Promise<void> {
    await db.deleteFrom("event").where("id", "=", id).execute();
}
