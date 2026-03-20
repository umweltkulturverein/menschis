import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("shift")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("start_datetime", "timestamptz", (col) => col.notNull())
        .addColumn("end_datetime", "timestamptz", (col) => col.notNull())
        .addColumn("internal", "boolean", (col) =>
            col.notNull().defaultTo(false),
        )
        .addColumn("shift_kind", "integer", (col) =>
            col.references("shift_kind.id"),
        )
        .execute();

    await db.schema
        .alterTable("shift_kind")
        .dropColumn("internal")
        .dropColumn("default_location")
        .addColumn("authorization_message", "varchar(255)")
        .addColumn("authorization_magic_link_token", "varchar(50)")
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("shift_kind")
        .addColumn("internal", "boolean", (col) =>
            col.notNull().defaultTo(false),
        )
        .addColumn("default_location", "varchar(255)")
        .dropColumn("authorization_message")
        .dropColumn("authorization_magic_link_token")
        .execute();
    await db.schema
        .alterTable("shift_kind")
        .dropConstraint("shift_kind_pkey")
        .execute();

    await db.schema.dropTable("shift").execute();
}
