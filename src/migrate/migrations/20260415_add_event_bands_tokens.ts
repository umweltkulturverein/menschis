import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("event")
        .addColumn("backstage_access", "boolean")
        .addColumn("token_count", "integer")
        .dropColumn("days")
        .execute();
    await db.schema
        .createTable("event_days")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("day_title", "text")
        .addColumn("start_date", "date")
        .addColumn("event_id", "integer", (col) => col.references("event.id"))
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("event")
        .dropColumn("backstage_access")
        .dropColumn("token_count")
        .addColumn("days", "jsonb", (col) =>
        col.notNull().defaultTo(sql`'[]'::jsonb`),)
        .execute();
    await db.schema.dropTable("event_days").execute();
}
