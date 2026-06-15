import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { requireAdminUser } from "@/lib/auth/permissions";
import { GetShiftKindsByEvent, CreateShiftKind } from "@/lib/db/shifts";
import { generateMagicLinkToken } from "@/lib/db/shiftKinds";
import type { NewShiftKind } from "@/types/shift";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const kinds = await GetShiftKindsByEvent(Number(id));
  return NextResponse.json(kinds);
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

  const authorizationMessage = body.authorizationMessage || null;

  const kind: NewShiftKind = {
    eventId: Number(id),
    title: body.title,
    description: body.description ?? null,
    icon: body.icon ?? null,
    color: body.color,
    authorizationMessage,
    // Generated up front so a restricted kind always has a shareable link.
    authorizationMagicLinkToken: authorizationMessage
      ? generateMagicLinkToken()
      : null,
    allAccess: body.allAccess ?? false,
  };

  const created = await CreateShiftKind(kind);
  return NextResponse.json(created, { status: 201 });
}
