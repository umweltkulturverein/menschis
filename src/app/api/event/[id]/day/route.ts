import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireInternalUser } from "@/lib/permissions";
import { CreateEventDay, GetEventDays } from "@/lib/db/eventDays";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const days = await GetEventDays(Number(id));
    return NextResponse.json(days);
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getServerSession(authOptions);
    const authError = requireInternalUser(session);
    if (authError) return authError;

    const { id } = await params;
    const body = await req.json();

    const day = await CreateEventDay({
        eventId: Number(id),
        dayTitle: body.dayTitle,
        startDate: body.startDate ? new Date(body.startDate) : null,
        shopItemId: body.shopItemId || null,
    });
    return NextResponse.json(day, { status: 201 });
}
