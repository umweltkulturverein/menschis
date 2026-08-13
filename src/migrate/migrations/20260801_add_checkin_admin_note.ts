import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("shift_entry")
        .addColumn("checked_in_at", "timestamptz")
        .addColumn("admin_note", "text")
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("shift_entry")
        .dropColumn("checked_in_at")
        .dropColumn("admin_note")
        .execute();
}
