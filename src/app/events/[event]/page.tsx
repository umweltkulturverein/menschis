import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { redirect, RedirectType } from "next/navigation";
import { GetEvent } from "@/lib/db/events";
import { GetEventDays } from "@/lib/db/eventDays";
import { GetShiftKindsByEvent } from "@/lib/db/shiftKinds";
import { GetShiftDatetimesByEvent } from "@/lib/db/shifts";
import EventBanner from "@/components/Events/EventBanner";
import ShiftFilterBar from "@/components/Shifts/ShiftFilterBar";
import { Suspense } from "react";
import ShiftSummary from "@/components/Shifts/ShiftSummary";
import PencilIcon from "@/components/icons/PencilIcon";
import Link from "next/link";
import {
  isAdminUser,
  isInternalUser,
  requireInternalUser,
} from "@/lib/auth/permissions";
import { computeTimeAxis, computeBaseDays, parseFilters } from "@/lib/shifts/filters";
import { getTranslations } from "next-intl/server";

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ event: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { event: eventId } = await params;
  const sp = await searchParams;
  const session = await getServerSession(authOptions);
  const authError = await requireInternalUser(session);
  const event = await GetEvent(Number(eventId));
  const turnstile = process.env.TURNSTILE_SITE_KEY;
  if (event === undefined) {
    redirect("/404", RedirectType.replace);
  }
  const filters = parseFilters((key) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  });
  const [days, kinds, shiftTimes] = await Promise.all([
    GetEventDays(event.id),
    GetShiftKindsByEvent(event.id),
    GetShiftDatetimesByEvent(event.id, authError),
  ]);
  const t = await getTranslations();
  const baseDays = computeBaseDays(shiftTimes);
  const timeAxis = computeTimeAxis(shiftTimes, baseDays);
  const visibleDays = filters.dayIds.length
    ? days.filter((d) => filters.dayIds.includes(d.id))
    : days;
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-ci-blue-800">
      {turnstile && (
        <>
          <script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            async
            defer
          ></script>
          <link rel="preconnect" href="https://challenges.cloudflare.com" />
        </>
      )}
      <EventBanner event={event} editable={isAdminUser(session)} />
      <div className="max-w-9xl mx-auto px-6 pt-8">
        {isAdminUser(session) && (
          <div className="flex justify-end mb-4">
            <Link
              href={`/events/${eventId}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-ci-blue-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <PencilIcon className="w-3.5 h-3.5" />
              {t("Events.edit")}
            </Link>
          </div>
        )}
        <ShiftFilterBar
          kinds={kinds}
          days={days}
          bounds={timeAxis}
          showInternal={isInternalUser(session)}
        />
      </div>
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <Suspense
          fallback={
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t("Shifts.loading")}
            </p>
          }
        >
          <div className="-mt-8">
            {days.length > 0 ? (
              visibleDays.map((day) => (
                <div key={day.id}>
                  <h1 className="text-2xl m-2 pt-8">{day.dayTitle}</h1>
                  <ShiftSummary
                    eventId={event.id}
                    eventDayId={day.id}
                    authError={authError}
                    filters={filters}
                    baseDays={baseDays}
                  />
                </div>
              ))
            ) : (
              <div className="pt-8">
                <ShiftSummary
                  authError={authError}
                  eventId={event.id}
                  filters={filters}
                  baseDays={baseDays}
                />
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
