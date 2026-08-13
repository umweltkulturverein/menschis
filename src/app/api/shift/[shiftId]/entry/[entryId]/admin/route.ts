import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/nextauth";
import { requireAdminUser } from "@/lib/auth/permissions";
import { UpdateShiftEntryAdminFields } from "@/lib/db/shiftEntries";
import { adminEntryState } from "@/lib/shifts/entryView";
import type { UpdateShiftEntry } from "@/types/shift";

/** Check-in state and the admin-only note. Separate from the owner PATCH on the
 *  parent route: that one is scoped to the entry's own person, this one is
 *  scoped to admins and never touches what the owner sees. */
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ shiftId: string; entryId: string }> },
) {
    const session = await getServerSession(authOptions);
    const authError = requireAdminUser(session);
    if (authError) {
        return authError;
    }

    const { entryId: entryIdParam } = await params;
    const entryId = parseInt(entryIdParam);
    if (isNaN(entryId)) {
        return NextResponse.json(
            { error: "Invalid entry ID" },
            { status: 400 },
        );
    }

    const { checkedIn, adminNote } = await req.json();

    // Only the fields actually sent are written, so toggling the check-in does
    // not clobber a note another admin is editing at the same time.
    const patch: Pick<
        UpdateShiftEntry,
        "checkedInAt" | "adminNote" | "verified"
    > = {};
    if (typeof checkedIn === "boolean") {
        patch.checkedInAt = checkedIn ? new Date() : null;
        if (checkedIn) patch.verified = true;
    }
    if (typeof adminNote === "string") {
        patch.adminNote = adminNote.trim() || null;
    }
    if (Object.keys(patch).length === 0) {
        return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await UpdateShiftEntryAdminFields(entryId, patch);
    if (!updated) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json({ id: updated.id, ...adminEntryState(updated) });
}
