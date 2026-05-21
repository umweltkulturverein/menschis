import { NextResponse } from "next/server";
import {
    ConfirmPendingEntriesByPerson,
    GetPendingEntriesByPerson,
} from "@/lib/db/shiftEntries";
import { getAuthenticatedPerson } from "@/lib/auth/userauth";

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
    return NextResponse.json({ confirmed });
}
