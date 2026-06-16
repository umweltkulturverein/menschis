import { NewShiftKind, ShiftKind, UpdateShiftKind } from "@/types/shift";
import { db } from "@/db";

/** Token shared via the restricted-access magic link. UUID fits the
 *  `authorization_magic_link_token varchar(50)` column. */
export function generateMagicLinkToken(): string {
    return crypto.randomUUID();
}

export async function CreateShiftKind(kind: NewShiftKind): Promise<ShiftKind> {
    return await db
        .insertInto("shiftKind")
        .values(kind)
        .returningAll()
        .executeTakeFirstOrThrow();
}

export async function GetShiftKindsByEvent(
    eventId: number,
): Promise<ShiftKind[]> {
    return await db
        .selectFrom("shiftKind")
        .selectAll()
        .where("eventId", "=", eventId)
        .execute();
}
export async function GetShiftKindById(
    id: number,
): Promise<ShiftKind> {
    return await db
        .selectFrom("shiftKind")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirstOrThrow();
}

export async function UpdateShiftKindRow(
    id: number,
    eventId: number,
    patch: UpdateShiftKind,
): Promise<ShiftKind | undefined> {
    return await db
        .updateTable("shiftKind")
        .set(patch)
        .where("id", "=", id)
        .where("eventId", "=", eventId)
        .returningAll()
        .executeTakeFirst();
}

export async function DeleteShiftKind(
    id: number,
    eventId: number,
): Promise<void> {
    await db
        .deleteFrom("shiftKind")
        .where("id", "=", id)
        .where("eventId", "=", eventId)
        .execute();
}
