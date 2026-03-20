import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("shift_kind")
        .addColumn("event_id", "integer", (col) => col.references("event.id").notNull())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("shift_kind")
        .dropColumn("event_id")
        .execute();
}
