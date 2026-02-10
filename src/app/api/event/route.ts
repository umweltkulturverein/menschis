import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function GET(request: Request) {
    await db.execute(sql`select * from Events where public = True`);
}
