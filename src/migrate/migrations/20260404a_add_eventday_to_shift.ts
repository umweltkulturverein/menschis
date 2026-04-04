import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("shift")
        .addColumn("event_day", "text")
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("shift").dropColumn("event_day").execute();
}
