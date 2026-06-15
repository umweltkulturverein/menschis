import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { requireAdminUser } from "@/lib/auth/permissions";
import {
  DeleteShiftKind,
  GetShiftKindById,
  UpdateShiftKindRow,
  generateMagicLinkToken,
} from "@/lib/db/shiftKinds";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; kindId: string }> },
) {
  const session = await getServerSession(authOptions);
  const authError = requireAdminUser(session);
  if (authError) return authError;

  const { id, kindId } = await params;
  const body = await req.json();

  const patch: {
    title?: string;
    description?: string | null;
    icon?: string | null;
    allAccess?: boolean;
    color?: string;
    authorizationMessage?: string | null;
    authorizationMagicLinkToken?: string | null;
  } = {};
  if (body.title !== undefined) patch.title = body.title;
  if (body.description !== undefined)
    patch.description = body.description || null;
  if (body.icon !== undefined) patch.icon = body.icon || null;
  if (body.color !== undefined) patch.color = body.color;
  if (body.allAccess !== undefined) patch.allAccess = body.allAccess;
  if (body.authorizationMessage !== undefined)
    patch.authorizationMessage = body.authorizationMessage || null;

  // Keep the magic-link token in sync with restricted access:
  //  - explicit rotate replaces it (invalidating old links)
  //  - a newly restricted kind gets one; clearing the message clears it
  const current = await GetShiftKindById(Number(kindId));
  if (body.rotateMagicLinkToken) {
    patch.authorizationMagicLinkToken = generateMagicLinkToken();
  } else if (patch.authorizationMessage !== undefined) {
    if (patch.authorizationMessage === null) {
      patch.authorizationMagicLinkToken = null;
    } else if (!current.authorizationMagicLinkToken) {
      patch.authorizationMagicLinkToken = generateMagicLinkToken();
    }
  }

  const updated = await UpdateShiftKindRow(Number(kindId), Number(id), patch);
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; kindId: string }> },
) {
  const session = await getServerSession(authOptions);
  const authError = requireAdminUser(session);
  if (authError) return authError;

  const { id, kindId } = await params;
  await DeleteShiftKind(Number(kindId), Number(id));
  return new NextResponse(null, { status: 204 });
}
