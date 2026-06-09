import {GetEvent} from "@/lib/db/events";
import {GetEventDay, GetEventDays} from "@/lib/db/eventDays";
import {CreateOrder} from "@/lib/ticket/pretix";
import {GetShiftById} from "@/lib/db/shifts";
import {GetShiftKindById} from "@/lib/db/shiftKinds";

export async function IssueOrder(
    shiftId: number,
    name: string,
    email: string,
): Promise<string> {
    let shopItemIds: string[] = [];

    const shift = await GetShiftById(shiftId)
    console.log("shift" + shiftId);
    if (!shift?.eventDayId) return "";

    const shiftKind = await GetShiftKindById(shift.shiftKind)

    const day = await GetEventDay(shift.eventDayId);
    if (!day?.shopItemId) return "";
    shopItemIds = [day.shopItemId];
    if (shiftKind.allAccess) {
        const days = await GetEventDays(day.eventId)
        shopItemIds = days
            .map(d => d.shopItemId)
            .filter((id): id is string => !!id)
    }



    const event = await GetEvent(day.eventId);
    console.log("event" + event);
    if (!event?.shopEventId) return "";

    return await CreateOrder(
        event.shopEventId,
        name,
        email,
        shopItemIds,
    );
}
