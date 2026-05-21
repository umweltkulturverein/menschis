"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { NaturalDateTime } from "@/lib/misc/contextAwareDates";

interface PendingEntry {
    id: number;
    shiftId: number;
    shiftKindTitle: string;
    eventTitle: string;
    startDatetime: string;
    endDatetime: string;
}

/**
 * Runs on every page load / hard refresh. For an authenticated user it looks up
 * any pending (unconfirmed) shift sign-ups and asks the owner to accept them.
 * "Annehmen" confirms all of them; "Ablehnen" just closes the pop-up, leaving
 * them pending so the expiry sweeper removes them after the 30-minute window.
 */
export default function PendingShiftsPopup() {
    const { status } = useSession();
    const [pending, setPending] = useState<PendingEntry[]>([]);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const header = new Headers();
    useEffect(() => {
        if (status !== "authenticated") return;

        if (header.has("deny-pending-shifts")) {
            return;
        }
        let active = true;
        fetch("/api/auth/pending")
            .then((r) => (r.ok ? r.json() : []))
            .then((data: PendingEntry[]) => {
                if (active && Array.isArray(data) && data.length > 0) {
                    setPending(data);
                    setOpen(true);
                }
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, [status]);

    if (!open || pending.length === 0) return null;

    const accept = async () => {
        setSubmitting(true);
        try {
            await fetch("/api/auth/pending", { method: "POST" });
        } finally {
            setSubmitting(false);
            setOpen(false);
        }
    };
    const deny = () => {
        header.set("deny-pending-shifts", "true")
        setOpen(false);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg mx-4 p-6 bg-white dark:bg-ci-blue-700 rounded-lg shadow-xl">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                    Schichten bestätigen
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                    Du wurdest für die folgenden Schichten eingetragen. Bitte
                    bestätige sie, sonst werden sie automatisch storniert.
                </p>

                <ul className="space-y-2 mb-5 max-h-72 overflow-y-auto">
                    {pending.map((e) => (
                        <li
                            key={e.id}
                            className="rounded-md border border-gray-200 dark:border-ci-blue-600 px-3 py-2"
                        >
                            <div className="text-sm font-medium text-gray-800 dark:text-white">
                                {e.shiftKindTitle}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-300">
                                {e.eventTitle} ·{" "}
                                {NaturalDateTime(new Date(e.startDatetime))}
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="flex gap-3 justify-end items-center">
                    <button
                        type="button"
                        onClick={deny}
                        disabled={submitting}
                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
                    >
                        Ablehnen
                    </button>
                    <button
                        type="button"
                        onClick={accept}
                        disabled={submitting}
                        className="px-4 py-2 bg-ci-green-500 hover:bg-ci-green-600 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors cursor-pointer"
                    >
                        {submitting ? "..." : "Annehmen"}
                    </button>
                </div>
            </div>
        </div>
    );
}
