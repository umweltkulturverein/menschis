import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { Database } from "@/types/event";

if (!process.env.DATABASE_URL) {
    throw new Error("env DATABASE_URL is required and missing");
}

export const db = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new Pool({ connectionString: process.env.DATABASE_URL }),
    }),
    plugins: [new CamelCasePlugin()],
});
