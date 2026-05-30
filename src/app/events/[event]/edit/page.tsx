import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { isAdminUser } from "@/lib/auth/permissions";
import { redirect, RedirectType } from "next/navigation";
import { GetEventAdmin } from "@/lib/db/events";
import { GetEventDays } from "@/lib/db/eventDays";
import { GetShiftKindsByEvent } from "@/lib/db/shiftKinds";
import { GetShiftsByEvent } from "@/lib/db/shifts";
import EventBanner from "@/components/Events/EventBanner";
import ShiftKindForm from "@/components/Shifts/Admin/ShiftKindForm";
import ShiftForm from "@/components/Shifts/Admin/ShiftForm";
import EventDayForm from "@/components/Events/EventDayForm";
import CopyButton from "@/components/Misc/CopyButton";
import { NaturalDateTime } from "@/lib/misc/contextAwareDates";
import { StringToColour } from "@/lib/misc/color";

export default async function EventEditPage({
  params,
}: {
  params: Promise<{ event: string }>;
}) {
  const { event: eventId } = await params;
  const session = await getServerSession(authOptions);
  if (!isAdminUser(session)) {
    redirect(`/events/${eventId}`, RedirectType.replace);
  }

  const event = await GetEventAdmin(Number(eventId));
  if (event === undefined) {
    redirect("/404", RedirectType.replace);
  }

  const [shiftKinds, shifts, eventDays] = await Promise.all([
    GetShiftKindsByEvent(Number(eventId)),
    GetShiftsByEvent(Number(eventId)),
    GetEventDays(Number(eventId)),
  ]);

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const loginUrl = `${base}/api/auth/signin/oidc?callbackUrl=${encodeURIComponent(`/events/${eventId}`)}`;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-ci-blue-800">
      <EventBanner event={event} editable />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Internal Shift Entry Link
          </h2>
          <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-ci-blue-700 border border-gray-200 dark:border-gray-600 px-3 py-2 shadow-sm">
            <span className="flex-1 text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
              {loginUrl}
            </span>
            <CopyButton value={loginUrl} />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Share with internal members — signs in via SSO and lands on this
            event.
          </p>
        </section>

        {/* Event Days */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Event Days
            </h2>
            <EventDayForm eventId={event.id} />
          </div>

          {eventDays.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No days yet.
            </p>
          ) : (
            <div className="space-y-2">
              {eventDays.map((day) => (
                <div
                  key={day.id}
                  className="relative min-h-full min-w-full group"
                >
                  <div className="z-10 absolute inset-0 flex items-center justify-center">
                    <EventDayForm eventId={event.id} day={day} edit />
                  </div>
                  <div className="flex group-hover:brightness-75 items-center gap-4 p-4 rounded-lg bg-white dark:bg-ci-blue-700 shadow-sm">
                    <span
                      style={{
                        backgroundColor: StringToColour(day.dayTitle),
                      }}
                      className="w-2 self-stretch rounded-full shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {day.dayTitle}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                        {day.shopItemId
                          ? `Shop item ${day.shopItemId}`
                          : "No shop item"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Shift Kinds */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Shift Kinds
            </h2>
            <ShiftKindForm eventId={event.id} />
          </div>

          {shiftKinds.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No shift kinds yet. Create one to get started.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shiftKinds.map((kind) => (
                <div
                  key={kind.id}
                  className="relative group rounded-lg overflow-hidden shadow-md bg-white dark:bg-ci-blue-700"
                >
                  <div className="z-20 absolute inset-0 flex items-center justify-center">
                    <ShiftKindForm eventId={event.id} kind={kind} edit />
                  </div>
                  <div className="group-hover:brightness-75">
                    <div
                      className="w-full h-16 flex items-center justify-center"
                      style={{
                        backgroundColor: kind.color,
                      }}
                    >
                      <span className="text-2xl">{kind.icon ?? "📋"}</span>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                        {kind.title}
                      </h3>
                      {kind.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {kind.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Shifts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Shifts
            </h2>
            <ShiftForm
              eventId={event.id}
              shiftKinds={shiftKinds}
              days={eventDays}
            />
          </div>

          {shifts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No shifts yet.
            </p>
          ) : (
            <div className="space-y-2">
              {shifts.map((shift) => {
                const kind = shiftKinds.find((k) => k.id === shift.shiftKind);
                const day = eventDays.find((d) => d.id === shift.eventDayId);
                return (
                  <div
                    key={shift.id}
                    className="relative min-h-full min-w-full group"
                  >
                    <div className="z-10 absolute inset-0 flex items-center justify-center">
                      <ShiftForm
                        eventId={event.id}
                        shiftKinds={shiftKinds}
                        days={eventDays}
                        shift={shift}
                        edit
                      />
                    </div>
                    <div className="flex group-hover:brightness-75  items-center gap-4 p-4 rounded-lg bg-white dark:bg-ci-blue-700 shadow-sm">
                      {kind && (
                        <div
                          className="w-2 self-stretch rounded-full shrink-0"
                          style={{
                            backgroundColor: kind.color,
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {kind?.icon ? `${kind.icon} ` : ""}
                          {kind?.title ?? "Unknown kind"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {NaturalDateTime(shift?.startDatetime)}
                        </p>
                      </div>
                      {shift.internal && (
                        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                          Internal
                        </span>
                      )}
                      {day ? (
                        <span
                          style={{
                            backgroundColor: StringToColour(day.dayTitle),
                          }}
                          className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full text-white  dark:text-white"
                        >
                          {day.dayTitle}
                        </span>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
