import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await sql`ALTER TABLE shift DROP CONSTRAINT shift_shift_kind_fkey`.execute(
        db,
    );
    await sql`
        ALTER TABLE shift
        ADD CONSTRAINT shift_shift_kind_fkey
        FOREIGN KEY (shift_kind) REFERENCES shift_kind(id) ON DELETE CASCADE
    `.execute(db);

    await sql`ALTER TABLE shift_entry DROP CONSTRAINT shift_entry_shift_fkey`.execute(
        db,
    );
    await sql`
        ALTER TABLE shift_entry
        ADD CONSTRAINT shift_entry_shift_fkey
        FOREIGN KEY (shift) REFERENCES shift(id) ON DELETE CASCADE
    `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
    await sql`ALTER TABLE shift_entry DROP CONSTRAINT shift_entry_shift_fkey`.execute(
        db,
    );
    await sql`
        ALTER TABLE shift_entry
        ADD CONSTRAINT shift_entry_shift_fkey
        FOREIGN KEY (shift) REFERENCES shift(id)
    `.execute(db);

    await sql`ALTER TABLE shift DROP CONSTRAINT shift_shift_kind_fkey`.execute(
        db,
    );
    await sql`
        ALTER TABLE shift
        ADD CONSTRAINT shift_shift_kind_fkey
        FOREIGN KEY (shift_kind) REFERENCES shift_kind(id)
    `.execute(db);
}
