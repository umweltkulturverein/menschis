import { getTranslations } from "next-intl/server";
import { GetEventShiftStats } from "@/lib/db/shifts";
import StatPanel from "@/components/Misc/StatPanel";
import CheckIcon from "@/components/icons/CheckIcon";

/** The KPI row at the top of the admin dashboard. Rendered only for admins by
 *  `EventShiftBoard`; the counts cover the whole event, not the current filter. */
export default async function EventStats({ eventId }: { eventId: number }) {
    const t = await getTranslations("Events");
    const stats = await GetEventShiftStats(eventId);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <StatPanel
                label={t("statBookedExternal")}
                value={stats.external.booked}
                total={stats.external.slots}
                icon={<UsersIcon />}
            />
            <StatPanel
                label={t("statBookedInternal")}
                value={stats.internal.booked}
                total={stats.internal.slots}
                icon={<LockIcon />}
            />
            <StatPanel
                label={t("statCheckedIn")}
                value={stats.checkedIn}
                total={stats.booked}
                icon={<CheckIcon className="w-3.5 h-3.5" />}
            />
            <StatPanel
                label={t("statUnverified")}
                value={stats.unverified}
                icon={<ClockIcon />}
                tone="alert"
            />
        </div>
    );
}

function UsersIcon() {
    return (
        <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    );
}
