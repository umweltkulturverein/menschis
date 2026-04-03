"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Shift, ShiftKind } from "@/types/shift";

interface Props {
    shift: Shift;
    kind: ShiftKind | undefined;
}

export default function ShiftPanel({ shift, kind }: Props) {
    const { data: session } = useSession();
    const [signing, setSigning] = useState(false);
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    async function handleConfirm() {
        setSubmitting(true);
        try {
            await fetch(`/api/shift/${shift.id}/entry`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes: note }),
            });
            setDone(true);
            setSigning(false);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="grid rounded-lg overflow-hidden shadow-md bg-white dark:bg-ci-blue-700">
            <div className="h-50">
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
                        {new Date(shift.startDatetime).toLocaleTimeString(
                            "de-DE",
                            { hour: "2-digit", minute: "2-digit" },
                        )}
                        {" – "}
                        {new Date(shift.endDatetime).toLocaleTimeString(
                            "de-DE",
                            { hour: "2-digit", minute: "2-digit" },
                        )}{" "}
                        Uhr
                    </p>
                </div>
            </div>

            <div className="align-bottom">
                <hr className="m-4" />
                <h5 className="text-center mb-4">X/{shift.slots}</h5>

                {session && !done && !signing && (
                    <div className="px-4 pb-4">
                        <button
                            onClick={() => setSigning(true)}
                            className="w-full text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
                        >
                            Anmelden
                        </button>
                    </div>
                )}

                {done && (
                    <p className="text-center text-sm text-green-600 dark:text-green-400 px-4 pb-4">
                        Angemeldet!
                    </p>
                )}

                {signing && (
                    <div className="px-4 pb-4 space-y-2">
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Notiz (optional)"
                            rows={2}
                            className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-ci-blue-600 text-gray-800 dark:text-white px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSigning(false)}
                                className="flex-1 text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-ci-blue-600"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={submitting}
                                className="flex-1 text-sm px-3 py-1.5 rounded-md bg-green-500 hover:bg-green-600 text-white font-medium disabled:opacity-50"
                            >
                                {submitting ? "..." : "Bestätigen"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
