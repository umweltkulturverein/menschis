import {
    AdminEntryState,
    ClientShiftEntry,
    ShiftEntry,
    ShiftEntryWithPerson,
} from "@/types/shift";
import { NaturalDateTime } from "@/lib/misc/contextAwareDates";

/** The admin-writable fields of an entry, formatted for the client. Shared by
 *  `projectEntry` and the admin PATCH route so a check-in looks the same
 *  whether it arrives with the page or as the response to a toggle. */
export function adminEntryState(entry: ShiftEntry): AdminEntryState {
    return {
        checkedIn: entry.checkedInAt !== null,
        checkedInAt: entry.checkedInAt
            ? NaturalDateTime(new Date(entry.checkedInAt))
            : null,
        adminNote: entry.adminNote ?? "",
        verified: entry.verified,
    };
}

/** What the viewer is allowed to see of an entry. Derived once per request from
 *  the session (see `entryViewer`) and handed to `projectEntry`. */
export interface EntryViewer {
    /** Person id of the viewer, so their own entry stays editable. */
    currentPersonId: number | null;
    /** Internal (non magic-link) user: sees co-workers on internal shifts. */
    internal: boolean;
    /** Admin: sees every entry in full, including the admin-only fields. */
    admin: boolean;
}

/** Narrow a stored entry down to what `viewer` may receive on the client.
 *  This is the only place entry visibility is decided — every surface that
 *  renders entries goes through it. */
export function projectEntry(
    entry: ShiftEntry | ShiftEntryWithPerson,
    shiftInternal: boolean,
    viewer: EntryViewer,
): ClientShiftEntry {
    const own = entry.person === viewer.currentPersonId;

    // Admins see the whole entry, plus the fields nobody else gets.
    if (viewer.admin) {
        return {
            id: entry.id,
            name: entry.name,
            notes: entry.notes,
            ...(own ? { person: entry.person } : {}),
            email: "personEmail" in entry ? entry.personEmail : "",
            // Rows written before phones were normalized hold "" rather than
            // null; collapse both to null so the client has one empty case.
            phone:
                ("personPhone" in entry ? entry.personPhone?.trim() : null) ||
                null,
            signedUpAt: NaturalDateTime(new Date(entry.createdAt)),
            ...adminEntryState(entry),
        };
    }
    // Own entry: editable, includes notes.
    if (own) {
        return {
            id: entry.id,
            name: entry.name,
            notes: entry.notes,
            person: entry.person,
        };
    }
    // Internal viewers see co-workers' names + notes on internal shifts (read-only).
    if (viewer.internal && shiftInternal) {
        return {
            id: entry.id,
            name: entry.name,
            notes: entry.notes
        };
    }
    // Everyone else just sees that the slot is taken.
    return { id: entry.id };
}
