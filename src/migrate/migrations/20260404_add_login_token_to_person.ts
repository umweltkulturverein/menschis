import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("person")
        .addColumn("login_token", "text")
        .execute();
    await db.schema
        .alterTable("person")
        .addUniqueConstraint("person_login_token_unique", ["login_token"])
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("person")
        .dropConstraint("person_login_token_unique")
        .execute();
    await db.schema
        .alterTable("person")
        .dropColumn("login_token")
        .execute();
}
