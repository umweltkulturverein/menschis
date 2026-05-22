import { Shift, ShiftKind, ShiftEntry, ClientShiftEntry } from "@/types/shift";
import ShiftEntries from "./Entry/ShiftEntries";

interface Props {
    shift: Shift;
    kind: ShiftKind | undefined;
    initialEntries: ShiftEntry[];
    currentPersonId: number | null;
    prefill: { name: string; email: string; phone: string };
}

export default function ShiftPanel({
    shift,
    kind,
    initialEntries,
    currentPersonId,
    prefill,
}: Props) {

    const clientEntries: ClientShiftEntry[] = initialEntries.map((e) => {
        return e.person === currentPersonId
            ? { id: e.id, name: e.name, notes: e.notes, person: e.person }
            : { id: e.id };
    });
        return (
        <div className="relative group flex flex-col rounded-lg overflow-hidden shadow-md bg-white dark:bg-ci-blue-700">
            {/* Header */}
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
                    })}
                    {" – "}
                    {new Date(shift.endDatetime).toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}{" "}
                    Uhr
                </p>
            </div>

            <hr className="mx-4" />

            <div className="relative flex-1">
                {kind?.authorizationMessage && (
                    <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <p className="text-white text-xs text-center font-medium px-4">
                            {kind.authorizationMessage}
                        </p>
                    </div>
                )}
                <ShiftEntries
                    shift={shift}
                    kind={kind}
                    initialEntries={clientEntries}
                    prefill={prefill}
                    turnsitleSiteKey={process.env.TURNSTILE_SITE_KEY}
                />
            </div>
        </div>
    );
}
