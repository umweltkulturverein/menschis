import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("user")
        .alterColumn("email", (col) => col.dropNotNull())
        .execute();
    await db.schema
        .alterTable("user")
        .alterColumn("phone", (col) => col.dropNotNull())
        .execute();
    await db.schema
        .alterTable("user")
        .alterColumn("roles", (col) => col.dropNotNull())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("user")
        .alterColumn("email", (col) => col.setNotNull())
        .execute();
    await db.schema
        .alterTable("user")
        .alterColumn("phone", (col) => col.setNotNull())
        .execute();
    await db.schema
        .alterTable("user")
        .alterColumn("roles", (col) => col.setNotNull())
        .execute();
}
