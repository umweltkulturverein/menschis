import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("event")
        .addColumn("ticketshop_id", "text")
        .execute();
    await db.schema
        .alterTable("event_days")
        .addColumn("ticketshop_id", "text")
        .execute();
}
export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("event")
        .dropColumn("ticketshop_id")
        .execute();
    await db.schema
        .alterTable("event_days")
        .dropColumn("ticketshop_id")
        .execute();
}
