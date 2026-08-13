import { Kysely, sql } from "kysely";

// These columns hold wall clocks, not instants: they were always written as
// naive strings from datetime-local inputs. With TZ unset the server parsed
// them as UTC, so reading them AT TIME ZONE 'UTC' returns the entered value
// unchanged. Pure relabelling — no times move.
// shift_entry.created_at/updated_at/checked_in_at stay timestamptz; those come
// from new Date() and are genuine instants.

export async function up(db: Kysely<any>): Promise<void> {
    await sql`
        ALTER TABLE shift
        ALTER COLUMN start_datetime TYPE timestamp
            USING start_datetime AT TIME ZONE 'UTC',
        ALTER COLUMN end_datetime TYPE timestamp
            USING end_datetime AT TIME ZONE 'UTC'
    `.execute(db);

    await sql`
        ALTER TABLE event
        ALTER COLUMN start_date TYPE timestamp
            USING start_date AT TIME ZONE 'UTC',
        ALTER COLUMN end_date TYPE timestamp
            USING end_date AT TIME ZONE 'UTC',
        ALTER COLUMN start_booking_date_time TYPE timestamp
            USING start_booking_date_time AT TIME ZONE 'UTC'
    `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
    await sql`
        ALTER TABLE shift
        ALTER COLUMN start_datetime TYPE timestamptz
            USING start_datetime AT TIME ZONE 'UTC',
        ALTER COLUMN end_datetime TYPE timestamptz
            USING end_datetime AT TIME ZONE 'UTC'
    `.execute(db);

    await sql`
        ALTER TABLE event
        ALTER COLUMN start_date TYPE timestamptz
            USING start_date AT TIME ZONE 'UTC',
        ALTER COLUMN end_date TYPE timestamptz
            USING end_date AT TIME ZONE 'UTC',
        ALTER COLUMN start_booking_date_time TYPE timestamptz
            USING start_booking_date_time AT TIME ZONE 'UTC'
    `.execute(db);
}
