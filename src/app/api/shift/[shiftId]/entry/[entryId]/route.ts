import {DeleteShiftEntry, GetShiftEntry, UpdateShiftEntryRow} from "@/lib/db/shiftEntries";
import { NextResponse } from "next/server";
import {CancelOrder} from "@/lib/ticket/pretix";
import {GetEventByShiftEntryId} from "@/lib/db/events";
import { getAuthenticatedPerson } from "@/lib/auth/userauth";
import { GetPersonById, UpdatePersonPhone } from "@/lib/db/persons";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { isAdminUser } from "@/lib/auth/permissions";

async function ownerScope(personId: number): Promise<number | null> {
    const session = await getServerSession(authOptions);
    return isAdminUser(session) ? null : personId;
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ shiftId: string; entryId: string }> },
) {
    const person = await getAuthenticatedPerson();
    if (person instanceof NextResponse) {
        return person;
    }

    const { entryId: entryIdParam } = await params;
    const entryId = parseInt(entryIdParam);
    if (isNaN(entryId)) {
        return NextResponse.json(
            { error: "Invalid entry ID" },
            { status: 400 },
        );
    }
    const scope = await ownerScope(person.id);
    const shiftentry = await GetShiftEntry(entryId, scope);

    // Once an admin has checked the person in on site, the sign-up is a record
    // of what happened and the owner can no longer withdraw it. Checked first,
    if (shiftentry?.checkedInAt && scope !== null) {
        return NextResponse.json(
            { error: "Entry is already checked in" },
            { status: 409 },
        );
    }

    const event = await GetEventByShiftEntryId(entryId);

    if (shiftentry?.order && event?.shopEventId !== undefined) {
        try{
            await CancelOrder(event.shopEventId, shiftentry?.order ?? "");
        }
        catch(e){
            console.error("Cancelling the Ticket Order Failed: " + (e as Error).message);
            return new NextResponse("Error cancelling the Order", { status: 500 });
        }
    } else {
        console.log("No Order found for this Entry");
    }
    await DeleteShiftEntry(entryId, scope);
    return new NextResponse(null, { status: 204 });
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ shiftId: string; entryId: string }> },
) {
    const person = await getAuthenticatedPerson();
    if (person instanceof NextResponse) {
        return person;
    }

    const { entryId: entryIdParam } = await params;
    const entryId = parseInt(entryIdParam);
    if (isNaN(entryId)) {
        return NextResponse.json(
            { error: "Invalid entry ID" },
            { status: 400 },
        );
    }

    const { name, notes, phone } = await req.json();
    const updated = await UpdateShiftEntryRow(
        entryId,
        await ownerScope(person.id),
        {
            name: name ?? "",
            notes: notes ?? ""
        });

    if (!updated) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    let owner = await GetPersonById(updated.person);
    if (owner && typeof phone === "string") {
        owner = await UpdatePersonPhone(owner, phone);
    }

    return NextResponse.json({
        id: updated.id,
        name: updated.name,
        notes: updated.notes,
        phone: owner?.phone ?? null,
    });
}
