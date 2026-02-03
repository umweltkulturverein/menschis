import { DESTRUCTION } from "dns";
import { pgTable, text, uuid, date } from "drizzle-orm/pg-core";
import { start } from "repl";

export const events = pgTable("events", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").primaryKey().notNull(),
    description: text("description"),
    startDay: date("start_day"),
    endDay: date("end_day"),
    location: text("location"),
});
