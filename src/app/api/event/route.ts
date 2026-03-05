import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { NewEvent } from "@/types/event";

export async function GET() {
    const events = await db
        .selectFrom("event")
        .selectAll()
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

    const newEvent: NewEvent = {
        title: body.title,
        description: body.description ?? null,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        startBookingDateTime: new Date(body.startBookingDateTime),
        public: body.public ?? false,
        location: body.location,
    };

    const event = await db
        .insertInto("event")
        .values(newEvent)
        .returningAll()
        .executeTakeFirstOrThrow();

    return NextResponse.json(event, { status: 201 });
}
