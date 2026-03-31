"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ShiftKind } from "@/types/shift";

interface Props {
    eventId: number;
    shiftKinds: ShiftKind[];
    days: string[];
}

export default function CreateShiftForm({ eventId, shiftKinds, days }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const fd = new FormData(e.currentTarget);
        const body = {
            shiftKindId: fd.get("shiftKindId") as string,
            startDatetime: fd.get("startDatetime") as string,
            endDatetime: fd.get("endDatetime") as string,
            slots: fd.get("slots") as string,
            internal: fd.get("internal") === "on",
        };

        const res = await fetch(`/api/event/${eventId}/shift`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        setSubmitting(false);

        if (!res.ok) {
            setError("Failed to create shift.");
            return;
        }

        (e.target as HTMLFormElement).reset();
        setOpen(false);
        router.refresh();
    }

    const inputClass =
        "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-ci-blue-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ci-blue-500";
    const labelClass =
        "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                disabled={shiftKinds.length === 0}
                title={
                    shiftKinds.length === 0
                        ? "Create a shift kind first"
                        : undefined
                }
                className="px-4 py-2 bg-ci-blue-500 hover:bg-ci-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
                + New Shift
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="w-full max-w-lg mx-4 p-6 bg-white dark:bg-ci-blue-700 rounded-lg shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                New Shift
                            </h2>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className={labelClass}>
                                    Shift Kind *
                                </label>
                                <select
                                    name="shiftKindId"
                                    required
                                    className={inputClass}
                                >
                                    <option value="">
                                        Select a shift kind…
                                    </option>
                                    {shiftKinds.map((kind) => (
                                        <option key={kind.id} value={kind.id}>
                                            {kind.icon ? `${kind.icon} ` : ""}
                                            {kind.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {days.length > 0 && (
                                <div>
                                    <label className={labelClass}>Day</label>
                                    <select name="day" className={inputClass}>
                                        {days.map((d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className={labelClass}>
                                    Number of Slots
                                </label>
                                <input
                                    name="slots"
                                    type="number"
                                    min="1"
                                    defaultValue="2"
                                    required
                                    className={inputClass}
                                ></input>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>
                                        Start *
                                    </label>
                                    <input
                                        name="startDatetime"
                                        type="datetime-local"
                                        required
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>End *</label>
                                    <input
                                        name="endDatetime"
                                        type="datetime-local"
                                        required
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    name="internal"
                                    type="checkbox"
                                    id="internal"
                                    className="rounded border-gray-300 dark:border-gray-600"
                                />
                                <label
                                    htmlFor="internal"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Internal shift
                                </label>
                            </div>

                            {error && (
                                <p
                                    className="text-red-500 text-sm"
                                    role="alert"
                                >
                                    {error}
                                </p>
                            )}

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-ci-blue-500 hover:bg-ci-blue-600 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors cursor-pointer"
                                >
                                    {submitting ? "Creating…" : "Create Shift"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
