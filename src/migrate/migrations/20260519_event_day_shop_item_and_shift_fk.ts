import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("event_days")
        .dropColumn("ticketshop_id")
        .execute();

    await db.schema
        .alterTable("event")
        .dropColumn("ticketshop_id")
        .execute();

    await db.schema
        .alterTable("event_days")
        .addColumn("shop_item_id", "text")
        .execute();

    await db.schema
        .alterTable("shift")
        .addColumn("event_day_id", "integer", (col) =>
            col.references("event_days.id").onDelete("set null"),
        )
        .execute();

    await sql`
        UPDATE shift
        SET event_day_id = event_days.id
        FROM shift_kind
        JOIN event_days ON event_days.event_id = shift_kind.event_id
        WHERE shift.shift_kind = shift_kind.id
          AND event_days.day_title = shift.event_day
    `.execute(db);

    await db.schema.alterTable("shift").dropColumn("event_day").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("shift")
        .addColumn("event_day", "text")
        .execute();

    await sql`
        UPDATE shift
        SET event_day = event_days.day_title
        FROM event_days
        WHERE shift.event_day_id = event_days.id
    `.execute(db);

    await db.schema.alterTable("shift").dropColumn("event_day_id").execute();

    await db.schema
        .alterTable("event_days")
        .dropColumn("shop_item_id")
        .execute();

    await db.schema
        .alterTable("event")
        .addColumn("ticketshop_id", "text")
        .execute();

    await db.schema
        .alterTable("event_days")
        .addColumn("ticketshop_id", "text")
        .execute();
}
