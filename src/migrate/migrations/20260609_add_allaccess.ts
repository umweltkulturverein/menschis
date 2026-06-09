import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("shift_kind")
        .addColumn("all_access", "boolean", (col) => col.notNull().defaultTo(false))
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("shift_kind")
        .dropColumn("all_access")
        .execute();
}
