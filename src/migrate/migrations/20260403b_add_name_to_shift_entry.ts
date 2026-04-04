import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("shift_entry")
        .addColumn("name", "text", (col) => col.notNull().defaultTo(""))
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("shift_entry").dropColumn("name").execute();
}
