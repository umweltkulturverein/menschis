import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("person")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("sub", "text", (col) => col.unique())
        .addColumn("name", "text", (col) => col.notNull())
        .addColumn("email", "text")
        .addColumn("phone", "text")
        .addColumn("roles", sql`text[]`)
        .execute();
    await db.schema
        .alterTable("shift_entry")
        .addColumn("person", "integer", (col) => col.references("person.id"))
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("shift_entry")
        .dropColumn("person")
        .execute();
    await db.schema.dropTable("person").execute();
}
