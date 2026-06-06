import EventPanel from "./EventPanel";
import { GetEvents } from "@/lib/db/events";
import { getTranslations } from "next-intl/server";
import {isInternalUser} from "@/lib/auth/permissions";
import {Session} from "next-auth";

export default async function EventSummary({
    session,
}: {
    session: Session | null;
}) {
    let events = await GetEvents();
    if (events !== undefined) {
        let isInternal = false
        if (session !== null) {
            isInternal = isInternalUser(session)
        }
        events = events.filter(e => e.public || isInternal)
    }


    if (events === undefined || events.length === 0) {
        const t = await getTranslations("Events");
        return (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t("none")}
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
