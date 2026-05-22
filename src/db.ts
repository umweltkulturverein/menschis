import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Pool, types } from "pg";
import { Database } from "@/types/database";

// pg returns int8/bigint columns as strings by default; parse them as numbers
types.setTypeParser(20, (val) => parseInt(val, 10));

if (!process.env.DATABASE_URL) {
    throw new Error("env DATABASE_URL is required and missing");
}

export const db = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new Pool({ connectionString: process.env.DATABASE_URL }),
    }),
    plugins: [new CamelCasePlugin()],
});
