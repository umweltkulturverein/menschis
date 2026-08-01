import {
    Shift,
    ShiftKind,
    ShiftEntry,
    ShiftEntryWithPerson,
    ClientShiftEntry,
} from "@/types/shift";
import Markdown from "react-markdown";
import ShiftEntries from "./Entry/ShiftEntries";
import { getTranslations } from "next-intl/server";
import { EntryViewer, projectEntry } from "@/lib/shifts/entryView";

interface Props {
    shift: Shift;
    kind: ShiftKind | undefined;
    authorized?: boolean;
    viewer: EntryViewer;
    initialEntries: (ShiftEntry | ShiftEntryWithPerson)[];
    prefill: { name: string; email: string; phone: string };
}

export default async function ShiftPanel({
    shift,
    kind,
    authorized,
    viewer,
    initialEntries,
    prefill,
}: Props) {
    const t = await getTranslations("Shifts");

    // Server-side boundary: only what the viewer may see crosses into the client.
    const clientEntries: ClientShiftEntry[] = initialEntries.map((e) =>
        projectEntry(e, shift.internal, viewer),
    );
    // Check Shift Starttime Serverside
    const shiftStarted = new Date(shift.startDatetime) <= new Date();
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
                        {kind?.title ?? t("unknownKind")}
                    </h2>
                    {shift.internal && (
                        <span className="ml-2 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                            {t("internal")}
                        </span>
                    )}
                </div>

                {kind?.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
                        {kind.description}
                    </p>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t("timeRange", {
                        start: new Date(shift.startDatetime).toLocaleTimeString(
                            "de-DE",
                            { hour: "2-digit", minute: "2-digit" },
                        ),
                        end: new Date(shift.endDatetime).toLocaleTimeString(
                            "de-DE",
                            { hour: "2-digit", minute: "2-digit" },
                        ),
                    })}
                </p>
            </div>

            <hr className="mx-4" />

            <div className="relative flex-1">
                {kind?.authorizationMessage && !authorized && (
                    <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="text-white text-xs text-center font-medium px-4 prose prose-invert prose-xs prose-p:m-0 prose-a:text-green-300">
                            <Markdown>{kind.authorizationMessage}</Markdown>
                        </div>
                    </div>
                )}
                <ShiftEntries
                    shift={shift}
                    kind={kind}
                    authorized={authorized}
                    initialEntries={clientEntries}
                    shiftStarted={shiftStarted}
                    prefill={prefill}
                    turnsitleSiteKey={process.env.TURNSTILE_SITE_KEY}
                />
            </div>
        </div>
    );
}
