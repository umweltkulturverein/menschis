import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("event")
        .addColumn("days", "jsonb", (col) =>
            col.notNull().defaultTo(sql`'[]'::jsonb`),
        )
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("event").dropColumn("days").execute();
}
