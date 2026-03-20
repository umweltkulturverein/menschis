import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const shift: NewShift = {
        startDatetime: new Date(body.startDatetime),
        endDatetime: new Date(body.endDatetime),
        internal: body.internal ?? false,
        shiftKind: Number(body.shiftKindId),
    };

    const created = await CreateShift(shift);
    return NextResponse.json(created, { status: 201 });
}
