import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("event")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("title", "varchar(255)", (col) => col.notNull())
        .addColumn("description", "text")
        .addColumn("start_date", "timestamptz", (col) => col.notNull())
        .addColumn("end_date", "timestamptz", (col) => col.notNull())
        .addColumn("start_booking_date_time", "timestamptz", (col) =>
            col.notNull(),
        )
        .addColumn("public", "boolean", (col) => col.notNull().defaultTo(false))
        .addColumn("location", "varchar(255)", (col) => col.notNull())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("event").execute();
}
