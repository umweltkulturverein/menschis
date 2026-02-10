import { pgTable, text, uuid, date, boolean } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
    id: uuid().primaryKey().defaultRandom(),
    title: text().primaryKey().notNull(),
    description: text(),
    startDay: date("start_day"),
    endDay: date("end_day"),
    location: text(),
    public: boolean(),
});
