"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Shift, ShiftKind, ShiftEntry } from "@/types/shift";

interface Props {
    shift: Shift;
    kind: ShiftKind | undefined;
    initialEntries: ShiftEntry[];
    currentPersonId: number | null;
    prefill: { name: string; email: string; phone: string };
}

type EntryForm = { name: string; email: string; phone: string; notes: string };

export default function ShiftPanel({
    shift,
    kind,
    initialEntries,
    currentPersonId,
    prefill,
}: Props) {
    const { data: session } = useSession();
    const [entries, setEntries] = useState<ShiftEntry[]>(initialEntries);
    const [shiftEntryForm, setShiftEntryForm] = useState<EntryForm | null>(
        null,
    );
    const [editing, setEditing] = useState<{
        id: number;
        name: string;
        notes: string;
    } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [guestSubmitted, setGuestSubmitted] = useState(false);

    const myEntries =
        currentPersonId != null
            ? entries.filter((e) => e.person === currentPersonId)
            : [];

    const isFull = entries.length >= shift.slots;
    const isGuest = !session;

    async function handleSignUp() {
        if (!shiftEntryForm) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/shift/${shift.id}/entry`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(shiftEntryForm),
            });
            if (res.ok) {
                const newEntry: ShiftEntry = await res.json();
                setEntries((prev) => [...prev, newEntry]);
                setShiftEntryForm(null);
                if (isGuest) setGuestSubmitted(true);
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(entryId: number, name: string) {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${name}'s Shift Entry?`,
        );
        if (!confirmed) return;
        await fetch(`/api/shift/${shift.id}/entry/${entryId}`, {
            method: "DELETE",
        });
        setEntries((prev) => prev.filter((e) => e.id !== entryId));
    }

    async function handleEdit() {
        if (!editing) return;
        setSubmitting(true);
        try {
            const res = await fetch(
                `/api/shift/${shift.id}/entry/${editing.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: editing.name,
                        notes: editing.notes,
                    }),
                },
            );
            if (res.ok) {
                const updated: ShiftEntry = await res.json();
                setEntries((prev) =>
                    prev.map((e) => (e.id === updated.id ? updated : e)),
                );
                setEditing(null);
            }
        } finally {
            setSubmitting(false);
        }
    }

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
                {/* Entry list */}
                <div className="px-4 pt-3 pb-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Anmeldungen
                        </span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                            {entries.length}/{shift.slots}
                        </span>
                    </div>

                    <div className="space-y-1.5">
                        {entries.map((entry) => {
                            const isOwn = entry.person === currentPersonId;
                            const isEditing = editing?.id === entry.id;

                            return (
                                <div
                                    key={entry.id}
                                    className="flex items-center gap-2 rounded-md bg-gray-50 dark:bg-ci-blue-600 px-2.5 py-1.5"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-ci-blue-500 flex items-center justify-center shrink-0">
                                        <svg
                                            className="w-3.5 h-3.5 text-gray-500 dark:text-gray-300"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>

                                    {isEditing && editing ? (
                                        <div className="flex-1 flex flex-col gap-1">
                                            <input
                                                value={editing.name}
                                                onChange={(e) =>
                                                    setEditing({
                                                        ...editing,
                                                        name: e.target.value,
                                                    })
                                                }
                                                placeholder="Name"
                                                className="flex-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-ci-blue-700 text-gray-800 dark:text-white px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                                            />
                                            <div className="flex gap-1">
                                                <input
                                                    value={editing.notes}
                                                    onChange={(e) =>
                                                        setEditing({
                                                            ...editing,
                                                            notes: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder="Notiz (optional)"
                                                    className="flex-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-ci-blue-700 text-gray-800 dark:text-white px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                                                />
                                                <button
                                                    onClick={handleEdit}
                                                    disabled={submitting}
                                                    className="text-xs text-green-600 dark:text-green-400 hover:underline disabled:opacity-50"
                                                >
                                                    OK
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setEditing(null)
                                                    }
                                                    className="text-xs text-gray-400 hover:underline"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs text-gray-600 dark:text-gray-300 truncate block">
                                                    {isOwn
                                                        ? entry.name ||
                                                          "Angemeldet"
                                                        : "Angemeldet"}
                                                </span>
                                                {isOwn && entry.notes && (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500 truncate block">
                                                        {entry.notes}
                                                    </span>
                                                )}
                                            </div>
                                            {isOwn && (
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() =>
                                                            setEditing({
                                                                id: entry.id,
                                                                name: entry.name,
                                                                notes: entry.notes,
                                                            })
                                                        }
                                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                        title="Bearbeiten"
                                                    >
                                                        <svg
                                                            className="w-3 h-3"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3a2 2 0 01.586-1.414z"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                entry.id,
                                                                entry.name,
                                                            )
                                                        }
                                                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                                        title="Abmelden"
                                                    >
                                                        <svg
                                                            className="w-3 h-3"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}

                        {Array.from({
                            length: Math.max(0, shift.slots - entries.length),
                        }).map((_, i) => (
                            <div
                                key={`empty-${i}`}
                                className="flex items-center gap-2 rounded-md border border-dashed border-gray-200 dark:border-ci-blue-500 px-2.5 py-1.5"
                            >
                                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-ci-blue-600 flex items-center justify-center shrink-0">
                                    <svg
                                        className="w-3.5 h-3.5 text-gray-300 dark:text-gray-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xs text-gray-300 dark:text-gray-500">
                                    Offen
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Guest submitted banner */}
                {guestSubmitted && (
                    <div className="mx-4 mb-4 mt-2 flex items-start gap-2 rounded-md bg-orange-50 dark:bg-amber-900 border border-orange-500 dark:border-orange-500 px-3 py-2">
                        <svg
                            className="w-4 h-4 text-orange-500 dark:text-orange-100 shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                        <p className="text-xs text-orange-500 dark:text-orange-100">
                            Check your email — verify the Shift. <br /> You can
                            also Delete and Edit with the Link provided to you.
                        </p>
                    </div>
                )}

                {/* Sign-up button */}
                {!shiftEntryForm && !isFull && !kind?.authorizationMessage && (
                    <div className="px-4 pb-4 pt-2">
                        <button
                            onClick={() =>
                                setShiftEntryForm({
                                    name: prefill.name,
                                    email: prefill.email,
                                    phone: prefill.phone,
                                    notes: "",
                                })
                            }
                            className="w-full text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
                        >
                            Anmelden
                        </button>
                    </div>
                )}

                {isFull && myEntries.length === 0 && !shiftEntryForm && (
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 px-4 pb-4 pt-2">
                        Ausgebucht
                    </p>
                )}

                {/* Unified sign-up form */}
                {shiftEntryForm && !kind?.authorizationMessage && (
                    <div className="px-4 pb-4 pt-2 space-y-2">
                        <input
                            value={shiftEntryForm.name}
                            onChange={(e) =>
                                setShiftEntryForm({
                                    ...shiftEntryForm,
                                    name: e.target.value,
                                })
                            }
                            placeholder="Name"
                            required
                            className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-ci-blue-600 text-gray-800 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                            type="email"
                            value={shiftEntryForm.email}
                            onChange={(e) =>
                                setShiftEntryForm({
                                    ...shiftEntryForm,
                                    email: e.target.value,
                                })
                            }
                            placeholder="E-Mail"
                            required
                            className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-ci-blue-600 text-gray-800 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                            type="tel"
                            value={shiftEntryForm.phone}
                            onChange={(e) =>
                                setShiftEntryForm({
                                    ...shiftEntryForm,
                                    phone: e.target.value,
                                })
                            }
                            placeholder="Telefon (optional)"
                            className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-ci-blue-600 text-gray-800 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <textarea
                            value={shiftEntryForm.notes}
                            onChange={(e) =>
                                setShiftEntryForm({
                                    ...shiftEntryForm,
                                    notes: e.target.value,
                                })
                            }
                            placeholder="Notiz (optional)"
                            rows={2}
                            className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-ci-blue-600 text-gray-800 dark:text-white px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {isGuest && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                You{"'"}ll receive an email link to edit and
                                verify your registration.
                            </p>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShiftEntryForm(null)}
                                className="flex-1 text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-ci-blue-600"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleSignUp}
                                disabled={
                                    submitting ||
                                    !shiftEntryForm.name.trim() ||
                                    !shiftEntryForm.email.trim()
                                }
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
