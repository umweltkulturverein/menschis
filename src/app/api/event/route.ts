import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import type { EventItem, NewEventItem } from "@/types/event";
import { CreateEvent } from "@/lib/db/events";

export async function GET() {
    const events = await db
        .selectFrom("event")
        .selectAll()
        .where("public", "=", true)
        .orderBy("startDate", "asc")
        .execute();
    return NextResponse.json(events);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const newEvent: NewEventItem = {
        title: body.title,
        description: body.description ?? null,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        startBookingDateTime: new Date(body.startBookingDateTime),
        public: body.public ?? false,
        location: body.location,
    };
    const event = await CreateEvent(newEvent);

    return NextResponse.json(event, { status: 201 });
}
