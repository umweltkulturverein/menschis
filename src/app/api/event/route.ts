import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { requireAdminUser } from "@/lib/auth/permissions";
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
  const authError = requireAdminUser(session);
  if (authError) return authError;

  const body = await req.json();

  const newEvent: NewEventItem = {
    title: body.title,
    description: body.description ?? null,
    infoText: body.infoText ?? null,
    shopEventId: body.shopEventId ?? null,
    startDate: new Date(body.startDate),
    endDate: new Date(body.endDate),
    startBookingDateTime: new Date(body.startBookingDateTime),
    public: body.public ?? false,
    location: body.location,
    backstageAccess: body.backstageAccess ?? false,
    tokenCount: body.tokenCount ?? 0,
  };
  const event = await CreateEvent(newEvent);

  return NextResponse.json(event, { status: 201 });
}
