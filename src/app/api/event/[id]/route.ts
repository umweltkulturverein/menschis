import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { requireInternalUser } from "@/lib/permissions";
import { DeleteEvent, GetEvent, UpdateEvent } from "@/lib/db/events";
import type { UpdateEventItem } from "@/types/event";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const id = Number((await params).id);
    return NextResponse.json(await GetEvent(id));
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getServerSession(authOptions);
    const authError = requireInternalUser(session);
    if (authError) return authError;

    const id = Number((await params).id);
    const body = await req.json();

    const patch: UpdateEventItem = {};
    if (body.title !== undefined) patch.title = body.title;
    if (body.description !== undefined)
        patch.description = body.description || null;
    if (body.shopEventId !== undefined)
        patch.shopEventId = body.shopEventId || undefined;
    if (body.startDate !== undefined)
        patch.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) patch.endDate = new Date(body.endDate);
    if (body.startBookingDateTime !== undefined)
        patch.startBookingDateTime = new Date(body.startBookingDateTime);
    if (body.public !== undefined) patch.public = body.public;
    if (body.location !== undefined) patch.location = body.location;

    const updated = await UpdateEvent(id, patch);
    if (!updated)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getServerSession(authOptions);
    const authError = requireInternalUser(session);
    if (authError) return authError;

    const id = Number((await params).id);
    await DeleteEvent(id);
    return new NextResponse(null, { status: 204 });
}
