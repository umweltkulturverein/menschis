import { NextResponse } from "next/server";
import {UpdateShiftEntry} from "@/types/shift";
import {
    ConfirmPendingEntriesByPerson,
    GetPendingEntriesByPerson, UpdateShiftEntryRow,
} from "@/lib/db/shiftEntries";
import { getAuthenticatedPerson } from "@/lib/auth/userauth";
import {IssueOrder} from "@/lib/ticket/main";

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
        await UpdateShiftEntryRow(entry.id, person.id, {order: order} )
    }

    return NextResponse.json({ confirmed });
}
