import { NextResponse } from "next/server";
import {
    ConfirmPendingEntriesByPerson,
    GetPendingEntriesByPerson, UpdateShiftEntryRow,
} from "@/lib/db/shiftEntries";
import { getAuthenticatedPerson } from "@/lib/auth/userauth";
import {IssueOrder} from "@/lib/ticket/main";
import {sendShiftEntryEmail} from "@/lib/email/email";
import {GetEventByShiftEntryId} from "@/lib/db/events";
import { GetShiftById } from "@/lib/db/shifts";
import {GetShiftKindById} from "@/lib/db/shiftKinds";
import {GetEventDay} from "@/lib/db/eventDays";

// GET: list the current user's pending (unconfirmed) sign-ups for the pop-up.
export async function GET() {
    const person = await getAuthenticatedPerson();
    if (person instanceof NextResponse) {
        return person;
    }
    const pending = await GetPendingEntriesByPerson(person.id);

    return NextResponse.json(pending);
}

// POST: the owner accepts — confirm all of their pending sign-ups.
export async function POST() {
    const person = await getAuthenticatedPerson();
    if (person instanceof NextResponse) {
        return person;
    }

    const confirmed = await ConfirmPendingEntriesByPerson(person.id);
    for (const entry of confirmed) {
        const order = await IssueOrder(entry.shift, entry.name, person.email);
        entry.order = order;
        await UpdateShiftEntryRow(entry.id, person.id, { order });

        const shift = await GetShiftById(entry.shift);
        const event = await GetEventByShiftEntryId(entry.id);
        if (!event) continue;
        const eventDay = shift.eventDayId
            ? await GetEventDay(shift.eventDayId)
            : null;
        const shiftKind = await GetShiftKindById(shift.shiftKind);
        await sendShiftEntryEmail({ entry, person, shift, shiftKind, event, eventDay });
    }

    return NextResponse.json({ confirmed });
}
