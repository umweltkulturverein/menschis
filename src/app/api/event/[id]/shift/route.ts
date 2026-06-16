import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { requireAdminUser } from "@/lib/auth/permissions";
import {
  GetShiftsByEvent,
  CreateShift,
  UpdateShiftById,
  DeleteShiftById,
} from "@/lib/db/shifts";
import type { NewShift, UpdateShift } from "@/types/shift";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const shifts = await GetShiftsByEvent(Number(id));
  return NextResponse.json(shifts);
}
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const shiftId = Number(id);
  const session = await getServerSession(authOptions);
  const authError = requireAdminUser(session);
  if (authError) return authError;
  if (isNaN(shiftId))
    return NextResponse.json("Shiftid not Valid", { status: 400 });
  await DeleteShiftById(shiftId);
  return new NextResponse(null, { status: 204 });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const authError = requireAdminUser(session);
  if (authError) return authError;

  const { id } = await params;
  const body = await req.json();

  const shift: NewShift = {
    startDatetime: new Date(body.startDatetime),
    eventDayId: body.eventDayId ? Number(body.eventDayId) : null,
    slots: Number(body.slots),
    endDatetime: new Date(body.endDatetime),
    internal: body.internal ?? false,
    shiftKind: Number(body.shiftKindId),
  };

  const created = await CreateShift(shift);
  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const authError = requireAdminUser(session);
  if (authError) return authError;

  const body = await req.json();
  const shiftId = Number(body.id);
  if (isNaN(shiftId))
    return NextResponse.json("Shiftid not Valid", { status: 400 });

  const shift: UpdateShift = {
    startDatetime: new Date(body.startDatetime),
    eventDayId: body.eventDayId ? Number(body.eventDayId) : null,
    slots: Number(body.slots),
    endDatetime: new Date(body.endDatetime),
    internal: body.internal ?? false,
    shiftKind: Number(body.shiftKindId),
  };

  const updated = await UpdateShiftById(shiftId, shift);
  return NextResponse.json(updated);
}
