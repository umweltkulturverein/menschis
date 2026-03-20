import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("shift_kind")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("title", "varchar(255)", (col) => col.notNull())
        .addColumn("description", "text")
        .addColumn("icon", "varchar(255)")
        .addColumn("color", "varchar(50)", (col) => col.notNull())
        .addColumn("default_location", "varchar(255)")
        .addColumn("internal", "boolean", (col) => col.notNull().defaultTo(false))
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("shift_kind").execute();
}
