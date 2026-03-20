import { GetShiftsByEvent, GetShiftKindsByEvent } from "@/lib/db/shifts";

export default async function ShiftSummary({ eventId }: { eventId: number }) {
    const [shifts, kinds] = await Promise.all([
        GetShiftsByEvent(eventId),
        GetShiftKindsByEvent(eventId),
    ]);

    if (shifts.length === 0) {
        return (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
                No shifts yet.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((shift) => {
                const kind = kinds.find((k) => k.id === shift.shiftKind);
                return (
                    <div
                        key={shift.id}
                        className="rounded-lg overflow-hidden shadow-md bg-white dark:bg-ci-blue-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 transform"
                    >
                        <div
                            className="w-full h-20 flex items-center justify-center"
                            style={{ backgroundColor: kind?.color ?? "#6b7280" }}
                        >
                            <span className="text-3xl">{kind?.icon ?? "📋"}</span>
                        </div>
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-1">
                                <h2 className="text-base font-bold text-gray-800 dark:text-white">
                                    {kind?.title ?? "Unknown kind"}
                                </h2>
                                {shift.internal && (
                                    <span className="ml-2 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                                        Internal
                                    </span>
                                )}
                            </div>
                            {kind?.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
                                    {kind.description}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(shift.startDatetime).toLocaleTimeString("de-DE", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}{" – "}
                                {new Date(shift.endDatetime).toLocaleTimeString("de-DE", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })} Uhr
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
