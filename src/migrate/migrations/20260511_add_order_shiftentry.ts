import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("shift_entry")
        .addColumn("order", "text")
        .addColumn("verified", "boolean", col => col.notNull().defaultTo(false))
        .execute();
    await db.schema
        .alterTable("event")
        .addColumn("shop_event_id", "text")
        .execute()

}
export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("shift_entry")
        .dropColumn("order")
        .dropColumn("verified")
        .execute();
    await db.schema
        .alterTable("event")
        .dropColumn("shop_event_id")
        .execute()
}
