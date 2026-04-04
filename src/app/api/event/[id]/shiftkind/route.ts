import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireInternalUser } from "@/lib/permissions";
import { GetShiftKindsByEvent, CreateShiftKind } from "@/lib/db/shifts";
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
    const authError = requireInternalUser(session);
    if (authError) return authError;

    const { id } = await params;
    const body = await req.json();

    const kind: NewShiftKind = {
        eventId: Number(id),
        title: body.title,
        description: body.description ?? null,
        icon: body.icon ?? null,
        color: body.color,
        authorizationMessage: body.authorizationMessage ?? null,
        authorizationMagicLinkToken: body.authorizationMagicLinkToken ?? null,
    };

    const created = await CreateShiftKind(kind);
    return NextResponse.json(created, { status: 201 });
}
