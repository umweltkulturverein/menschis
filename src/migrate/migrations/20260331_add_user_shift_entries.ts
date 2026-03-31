import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("shift")
        .addColumn("slots", "integer", (col) => col.notNull().defaultTo(2))
        .execute();
    await db.schema
        .createTable("user")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("sub", "text", (col) => col.unique())
        .addColumn("name", "text", (col) => col.notNull())
        .addColumn("email", "text", (col) => col.notNull())
        .addColumn("phone", "text", (col) => col.notNull())
        .addColumn("roles", sql`text[]`, (col) => col.notNull())
        .execute();
    await db.schema
        .createTable("shift_entry")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("created_at", "timestamptz", (col) => col.notNull())
        .addColumn("updated_at", "timestamptz", (col) => col.notNull())
        .addColumn("notes", "text", (col) => col.notNull())
        .addColumn("shift", "integer", (col) => col.references("shift.id"))
        .addColumn("user", "integer", (col) => col.references("user.id"))
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("shift").dropColumn("slots").execute();
    await db.schema.dropTable("user");
    await db.schema.dropTable("shift_entry");
}
