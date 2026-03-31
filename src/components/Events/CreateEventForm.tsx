"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateEventForm() {
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
            title: fd.get("title") as string,
            description: (fd.get("description") as string) || null,
            startDate: fd.get("startDate") as string,
            endDate: fd.get("endDate") as string,
            startBookingDateTime: fd.get("startBookingDateTime") as string,
            public: fd.get("public") === "on",
            location: fd.get("location") as string,
        };

        const res = await fetch("/api/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        setSubmitting(false);

        if (!res.ok) {
            setError("Failed to create event.");
            return;
        }

        (e.target as HTMLFormElement).reset();
        setOpen(false);
        router.refresh();
    }

    const inputClass =
        "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-ci-blue-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ci-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="mb-6 px-4 py-2 bg-ci-blue-500 hover:bg-ci-blue-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
                + New Event
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="w-full max-w-2xl mx-4 p-6 bg-white dark:bg-ci-blue-700 rounded-lg shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                New Event
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Title *</label>
                                    <input name="title" type="text" required className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Location *</label>
                                    <input name="location" type="text" required className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea name="description" rows={3} className={inputClass} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Start *</label>
                                    <input name="startDate" type="datetime-local" required className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>End *</label>
                                    <input name="endDate" type="datetime-local" required className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Booking opens *</label>
                                    <input name="startBookingDateTime" type="datetime-local" required className={inputClass} />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    name="public"
                                    type="checkbox"
                                    id="public"
                                    className="rounded border-gray-300 dark:border-gray-600"
                                />
                                <label htmlFor="public" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    List Publicly
                                </label>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm" role="alert">{error}</p>
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
                                    {submitting ? "Creating…" : "Create Event"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
