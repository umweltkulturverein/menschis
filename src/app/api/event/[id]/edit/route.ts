import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "kysely";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (Array.isArray(body.days)) {
        await db
            .updateTable("event")
            .set({ days: sql`${JSON.stringify(body.days)}::jsonb` })
            .where("id", "=", Number(id))
            .execute();
    }

    return NextResponse.json({ ok: true });
}
