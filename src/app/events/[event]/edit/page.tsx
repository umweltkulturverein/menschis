import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, RedirectType } from "next/navigation";
import { GetEventAdmin } from "@/lib/db/events";
import { GetShiftKindsByEvent, GetShiftsByEvent } from "@/lib/db/shifts";
import EventBanner from "@/components/Events/EventBanner";
import CreateShiftKindForm from "@/components/Shifts/CreateShiftKindForm";
import CreateShiftForm from "@/components/Shifts/CreateShiftForm";
import EventDaysEditor from "@/components/Events/EventDaysEditor";

export default async function EventEditPage({
    params,
}: {
    params: Promise<{ event: string }>;
}) {
    const { event: eventId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/api/auth/signin", RedirectType.replace);
    }

    const event = await GetEventAdmin(Number(eventId));
    if (event === undefined) {
        redirect("/404", RedirectType.replace);
    }

    const [shiftKinds, shifts] = await Promise.all([
        GetShiftKindsByEvent(Number(eventId)),
        GetShiftsByEvent(Number(eventId)),
    ]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-ci-blue-800">
            <EventBanner event={event} />

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
                {/* Event Days */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Event Days
                    </h2>
                    <EventDaysEditor eventId={event.id} days={event.days} />
                </section>

                {/* Shift Kinds */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Shift Kinds
                        </h2>
                        <CreateShiftKindForm eventId={event.id} />
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
                                    className="rounded-lg overflow-hidden shadow-md bg-white dark:bg-ci-blue-700"
                                >
                                    <div
                                        className="w-full h-16 flex items-center justify-center"
                                        style={{ backgroundColor: kind.color }}
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
                        <CreateShiftForm
                            eventId={event.id}
                            shiftKinds={shiftKinds}
                            days={event.days ?? []}
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
                                return (
                                    <div
                                        key={shift.id}
                                        className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-ci-blue-700 shadow-sm"
                                    >
                                        {kind && (
                                            <div
                                                className="w-2 self-stretch rounded-full shrink-0"
                                                style={{ backgroundColor: kind.color }}
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                                                {kind?.icon ? `${kind.icon} ` : ""}
                                                {kind?.title ?? "Unknown kind"}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {new Date(shift.startDatetime).toLocaleString("de-DE", {
                                                    dateStyle: "short",
                                                    timeStyle: "short",
                                                })}{" – "}
                                                {new Date(shift.endDatetime).toLocaleString("de-DE", {
                                                    dateStyle: "short",
                                                    timeStyle: "short",
                                                })}
                                            </p>
                                        </div>
                                        {shift.internal && (
                                            <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                                                Internal
                                            </span>
                                        )}
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
