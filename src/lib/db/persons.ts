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

export async function GetPersonByLoginToken(token: string): Promise<Person | undefined> {
    return await db
        .selectFrom("person")
        .selectAll()
        .where("loginToken", "=", token)
        .executeTakeFirst();
}

export async function FindOrCreatePersonByEmail(
    email: string,
    name: string,
    phone: string | null,
): Promise<Person> {
    const existing = await db
        .selectFrom("person")
        .selectAll()
        .where("email", "=", email)
        .executeTakeFirst();

    if (existing) {
        return await db
            .updateTable("person")
            .set({ name, phone: phone ?? existing.phone })
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
            phone,
            loginToken,
            roles: null,
        })
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
