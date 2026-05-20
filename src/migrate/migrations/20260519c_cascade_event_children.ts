import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await sql`ALTER TABLE shift_kind DROP CONSTRAINT shift_kind_event_id_fkey`.execute(
        db,
    );
    await sql`
        ALTER TABLE shift_kind
        ADD CONSTRAINT shift_kind_event_id_fkey
        FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE
    `.execute(db);

    await sql`ALTER TABLE event_days DROP CONSTRAINT event_days_event_id_fkey`.execute(
        db,
    );
    await sql`
        ALTER TABLE event_days
        ADD CONSTRAINT event_days_event_id_fkey
        FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE
    `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
    await sql`ALTER TABLE event_days DROP CONSTRAINT event_days_event_id_fkey`.execute(
        db,
    );
    await sql`
        ALTER TABLE event_days
        ADD CONSTRAINT event_days_event_id_fkey
        FOREIGN KEY (event_id) REFERENCES event(id)
    `.execute(db);

    await sql`ALTER TABLE shift_kind DROP CONSTRAINT shift_kind_event_id_fkey`.execute(
        db,
    );
    await sql`
        ALTER TABLE shift_kind
        ADD CONSTRAINT shift_kind_event_id_fkey
        FOREIGN KEY (event_id) REFERENCES event(id)
    `.execute(db);
}
