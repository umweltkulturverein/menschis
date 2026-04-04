import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireInternalUser } from "@/lib/permissions";
import { GetShiftsByEvent, CreateShift } from "@/lib/db/shifts";
import type { NewShift } from "@/types/shift";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const shifts = await GetShiftsByEvent(Number(id));
    return NextResponse.json(shifts);
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

    const shift: NewShift = {
        startDatetime: new Date(body.startDatetime),
        eventDay: body.day ?? undefined,
        slots: Number(body.slots),
        endDatetime: new Date(body.endDatetime),
        internal: body.internal ?? false,
        shiftKind: Number(body.shiftKindId),
    };

    const created = await CreateShift(shift);
    return NextResponse.json(created, { status: 201 });
}
