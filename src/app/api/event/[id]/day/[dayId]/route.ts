import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { requireAdminUser } from "@/lib/auth/permissions";
import { DeleteEventDay, UpdateEventDayRow } from "@/lib/db/eventDays";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; dayId: string }> },
) {
  const session = await getServerSession(authOptions);
  const authError = requireAdminUser(session);
  if (authError) return authError;

  const { id, dayId } = await params;
  const body = await req.json();

  const patch: {
    dayTitle?: string;
    startDate?: Date | null;
    shopItemId?: string | null;
  } = {};
  if (body.dayTitle !== undefined) patch.dayTitle = body.dayTitle;
  if (body.startDate !== undefined)
    patch.startDate = body.startDate ? new Date(body.startDate) : null;
  if (body.shopItemId !== undefined) patch.shopItemId = body.shopItemId || null;

  const updated = await UpdateEventDayRow(Number(dayId), Number(id), patch);
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; dayId: string }> },
) {
  const session = await getServerSession(authOptions);
  const authError = requireAdminUser(session);
  if (authError) return authError;

  const { id, dayId } = await params;
  await DeleteEventDay(Number(dayId), Number(id));
  return new NextResponse(null, { status: 204 });
}
