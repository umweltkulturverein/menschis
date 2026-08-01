import { db } from "@/db";
import { Selectable } from "kysely";
import { PersonTable } from "@/types/user";

export type Person = Selectable<PersonTable>;

export async function GetPersonBySub(sub: string): Promise<Person | undefined> {
    return await db
        .selectFrom("person")
        .selectAll()
        .where("sub", "=", sub)
        .executeTakeFirst();
}

export async function GetPersonByLoginToken(
    token: string,
): Promise<Person | undefined> {
    return await db
        .selectFrom("person")
        .selectAll()
        .where("loginToken", "=", token)
        .executeTakeFirst();
}

/** A phone field left empty means "not provided", not "clear it" — the sign-up
 *  form sends "" rather than null, which `??` would happily store, and an OIDC
 *  profile may carry no phone claim at all. */
export function normalizePhone(
    phone: string | null | undefined,
): string | null {
    return phone?.trim() || null;
}

export async function FindOrCreatePersonByEmail(
    email: string,
    name: string,
    phone: string | null,
): Promise<Person> {
    const newPhone = normalizePhone(phone);
    const existing = await db
        .selectFrom("person")
        .selectAll()
        .where("email", "=", email)
        .executeTakeFirst();

    if (existing) {
        return await db
            .updateTable("person")
            .set({ name, phone: newPhone ?? existing.phone })
            .where("id", "=", existing.id)
            .returningAll()
            .executeTakeFirstOrThrow();
    }

    const loginToken = crypto.randomUUID();
    return await db
        .insertInto("person")
        .values({
            sub: `email:${email}`,
            name,
            email,
            phone: newPhone,
            loginToken,
            roles: null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
}

/** Keep the account's phone in step with what a signed-in user typed into the
 *  sign-up form. Only ever fills one in — leaving the field blank must not wipe
 *  a number the person gave us earlier. */
export async function UpdatePersonPhone(
    person: Person,
    phone: string | null,
): Promise<Person> {
    const newPhone = normalizePhone(phone);
    if (!newPhone || newPhone === person.phone) return person;

    return await db
        .updateTable("person")
        .set({ phone: newPhone })
        .where("id", "=", person.id)
        .returningAll()
        .executeTakeFirstOrThrow();
}

export async function EnsureLoginToken(personId: number): Promise<string> {
    const person = await db
        .selectFrom("person")
        .select(["loginToken"])
        .where("id", "=", personId)
        .executeTakeFirstOrThrow();

    if (person.loginToken) return person.loginToken;

    const token = crypto.randomUUID();
    await db
        .updateTable("person")
        .set({ loginToken: token })
        .where("id", "=", personId)
        .execute();
    return token;
}
