"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
    eventId: number;
    days: string[] | null | undefined;
}

export default function EventDaysEditor({ eventId, days: initial }: Props) {
    const router = useRouter();
    const [days, setDays] = useState(initial ?? []);
    const [saving, setSaving] = useState(false);

    async function save(next: string[]) {
        setSaving(true);
        await fetch(`/api/event/${eventId}/edit`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ days: next }),
        });
        setSaving(false);
        router.refresh();
    }

    async function addDay(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const date = fd.get("date") as string;
        if (!date || days.includes(date)) return;
        const next = [...days, date].sort();
        setDays(next);
        (e.target as HTMLFormElement).reset();
        await save(next);
    }

    async function removeDay(date: string) {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${date}? all shifts will stay intact and have to be deleted manually.`,
        );
        if (!confirmed) return;
        const next = days.filter((d) => d !== date);
        setDays(next);
        await save(next);
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {days.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        No days added yet.
                    </p>
                )}
                {days.map((d) => (
                    <span
                        key={d}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-ci-blue-700 shadow-sm text-sm text-gray-800 dark:text-white"
                    >
                        {d}
                        <button
                            onClick={() => removeDay(d)}
                            className="text-gray-400 hover:text-red-500 transition-colors leading-none cursor-pointer"
                            aria-label={`Remove ${d}`}
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>

            <form onSubmit={addDay} className="flex items-center gap-2">
                <input
                    name="date"
                    type="text"
                    required
                    placeholder="e.g. Friday, Day 1…"
                    disabled={saving}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-ci-blue-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ci-blue-500"
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="px-3 py-2 bg-ci-blue-500 hover:bg-ci-blue-600 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors cursor-pointer"
                >
                    {saving ? "Saving…" : "+ Add"}
                </button>
            </form>
        </div>
    );
}
