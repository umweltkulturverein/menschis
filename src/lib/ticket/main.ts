import {GetEvent} from "@/lib/db/events";
import {GetEventDay} from "@/lib/db/eventDays";
import {CreateOrder} from "@/lib/ticket/pretix";
import {GetShiftById} from "@/lib/db/shifts";

export async function IssueOrder(
    shiftId: number,
    name: string,
    email: string,
): Promise<string> {
    const shift = await GetShiftById(shiftId)
    console.log("shift" + shiftId);
    if (!shift?.eventDayId) return "";

    const day = await GetEventDay(shift.eventDayId);
    console.log("day" + day);
    if (!day?.shopItemId) return "";

    const event = await GetEvent(day.eventId);
    console.log("event" + event);
    if (!event?.shopEventId) return "";

    return await CreateOrder(
        event.shopEventId,
        name,
        email,
        day.shopItemId,
        "4944231",
    );
}
