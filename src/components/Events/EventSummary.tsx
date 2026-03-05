import { db } from "@/db";
import EventPanel from "./EventPanel";

export default async function EventSummary() {
    const events = await db
        .selectFrom("event")
        .selectAll()
        .orderBy("startDate", "asc")
        .execute();

    if (events.length === 0) {
        return (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
                No events yet.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
                <EventPanel key={event.id} event={event} />
            ))}
        </div>
    );
}
