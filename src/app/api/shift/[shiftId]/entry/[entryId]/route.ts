import {DeleteShiftEntry, GetShiftEntry, UpdateShiftEntryRow} from "@/lib/db/shiftEntries";
import { NextResponse } from "next/server";
import {CancelOrder} from "@/lib/ticket/pretix";
import {GetEventByShiftEntryId} from "@/lib/db/events";
import { getAuthenticatedPerson } from "@/lib/auth/userauth";

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
    const shiftentry = await GetShiftEntry(entryId, person.id);
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
    await DeleteShiftEntry(entryId, person.id);
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

    const { name, notes } = await req.json();
    const updated = await UpdateShiftEntryRow(
        entryId,
        person.id,
        {
            name: name ?? "",
            notes: notes ?? ""
        });

    if (!updated) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
}
