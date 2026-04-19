import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { GetEvent } from "@/lib/db/events";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const id = Number((await params).id);

    return NextResponse.json(GetEvent(id));
}
