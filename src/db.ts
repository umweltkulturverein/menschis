import { drizzle } from "drizzle-orm/node-postgres";

if (!process.env.DATABASE_URL) {
    throw new Error("env DATABASE_URL is requried and missing");
}

export const db = drizzle(process.env.DATABASE_URL);
export const pool = db.$client;
