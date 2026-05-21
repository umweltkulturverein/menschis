import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { requireInternalUser } from "@/lib/permissions";
import { DeleteShiftKind, UpdateShiftKindRow } from "@/lib/db/shiftKinds";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string; kindId: string }> },
) {
    const session = await getServerSession(authOptions);
    const authError = requireInternalUser(session);
    if (authError) return authError;

    const { id, kindId } = await params;
    const body = await req.json();

    const patch: {
        title?: string;
        description?: string | null;
        icon?: string | null;
        color?: string;
        authorizationMessage?: string | null;
    } = {};
    if (body.title !== undefined) patch.title = body.title;
    if (body.description !== undefined)
        patch.description = body.description || null;
    if (body.icon !== undefined) patch.icon = body.icon || null;
    if (body.color !== undefined) patch.color = body.color;
    if (body.authorizationMessage !== undefined)
        patch.authorizationMessage = body.authorizationMessage || null;

    const updated = await UpdateShiftKindRow(
        Number(kindId),
        Number(id),
        patch,
    );
    if (!updated)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string; kindId: string }> },
) {
    const session = await getServerSession(authOptions);
    const authError = requireInternalUser(session);
    if (authError) return authError;

    const { id, kindId } = await params;
    await DeleteShiftKind(Number(kindId), Number(id));
    return new NextResponse(null, { status: 204 });
}
