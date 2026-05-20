import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { GetPersonBySub } from "@/lib/db/persons";
import {
    ConfirmPendingEntriesByPerson,
    GetPendingEntriesByPerson,
} from "@/lib/db/shiftEntries";

// GET: list the current user's pending (unconfirmed) sign-ups for the pop-up.
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json([]);
    }
    const person = await GetPersonBySub(session.user.id);
    if (!person) {
        return NextResponse.json([]);
    }
    const pending = await GetPendingEntriesByPerson(person.id);
    return NextResponse.json(pending);
}

// POST: the owner accepts — confirm all of their pending sign-ups.
export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const person = await GetPersonBySub(session.user.id);
    if (!person) {
        return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }
    const confirmed = await ConfirmPendingEntriesByPerson(person.id);
    return NextResponse.json({ confirmed });
}
