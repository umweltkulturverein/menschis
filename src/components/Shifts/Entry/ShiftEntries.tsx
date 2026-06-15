"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
    Shift,
    ShiftKind,
    ClientShiftEntry,
    OwnShiftEntry,
    isOwnEntry,
} from "@/types/shift";
import ShiftEntryRow from "./ShiftEntryRow";
import ShiftEntryForm from "./ShiftEntryForm";

interface Props {
    shift: Shift;
    kind: ShiftKind | undefined;
    authorized?: boolean;
    initialEntries: ClientShiftEntry[];
    prefill: { name: string; email: string; phone: string };
    turnsitleSiteKey: string | undefined;
}

type EntryForm = { name: string; email: string; phone: string; notes: string };
type EditState = { id: number; name: string; notes: string };

export default function ShiftEntries({
    shift,
    kind,
    authorized,
    initialEntries,
    prefill,
    turnsitleSiteKey
}: Props) {
    const { data: session } = useSession();
    const t = useTranslations("Entry");
    const [entries, setEntries] = useState<ClientShiftEntry[]>(initialEntries);
    const [signUpForm, setSignUpForm] = useState<EntryForm | null>(null);
    const [editing, setEditing] = useState<EditState | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [guestSubmitted, setGuestSubmitted] = useState(false);
    const [lastForm, setLastForm] = useState<EntryForm | null>(null);

    const myEntries = entries.filter(isOwnEntry);
    const isFull = entries.length >= shift.slots;
    // Restricted by an authorization message, unless the viewer holds the
    // matching magic-link access.
    const locked = !!kind?.authorizationMessage && !authorized;

    async function handleSignUp(form: EntryForm) {
        const wasGuest = !session || session.user.email !== form.email;
        setLastForm(form);
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`/api/shift/${shift.id}/entry`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                const data = await res.json();
                const newEntry: OwnShiftEntry = {
                    id: data.id,
                    name: data.name,
                    notes: data.notes,
                    person: data.person,
                };
                setEntries((prev) => [...prev, newEntry]);
                setSignUpForm(null);
                if (wasGuest) setGuestSubmitted(true);
            } else {
                const data = await res.json();
                setError(typeof data === "string" ? data : data.error ?? t("errorOccurred"));
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(entryId: number, name: string) {
        if (!window.confirm(t("deleteConfirm", { name }))) return;
        await fetch(`/api/shift/${shift.id}/entry/${entryId}`, {
            method: "DELETE",
        });
        setEntries((prev) => prev.filter((e) => e.id !== entryId));
    }

    async function handleEditConfirm() {
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
                const data = await res.json();
                const updated: OwnShiftEntry = {
                    id: data.id,
                    name: data.name,
                    notes: data.notes,
                    person: data.person,
                };
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
        <>
            {/* Entry list */}
            <div className="px-4 pt-3 pb-1">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {t("signUps")}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        {entries.length}/{shift.slots}
                    </span>
                </div>

                <div className="space-y-1.5">
                    {entries.map((entry) => (
                        <ShiftEntryRow
                            key={entry.id}
                            entry={entry}
                            editing={editing}
                            submitting={submitting}
                            onEdit={setEditing}
                            onEditChange={setEditing}
                            onEditCancel={() => setEditing(null)}
                            onEditConfirm={handleEditConfirm}
                            onDelete={handleDelete}
                        />
                    ))}

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
                                {t("open")}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Guest submitted banner */}
            {guestSubmitted && (
                <div className="mx-4 mb-4 mt-2 flex items-start gap-2 rounded-md bg-orange-50 dark:bg-amber-800 border border-orange-500 px-3 py-2">
                    <svg
                        className="w-4 h-4 text-orange-500 dark:text-white shrink-0 mt-0.5"
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
                    <p className="text-xs text-orange-400 dark:text-white">
                        {t("guestVerify", {
                            name: lastForm?.name ?? "",
                            email: lastForm?.email ?? "",
                        })}
                        <br />
                        <br />
                        {t("guestEdit")}
                    </p>
                </div>
            )}

            {/* Sign-up button */}
            {!signUpForm && !isFull && !locked && (
                <div className="px-4 pb-4 pt-2">
                    <button
                        onClick={() => {
                            setSignUpForm({
                                name: prefill.name || session?.user?.name || "",
                                email:
                                    prefill.email || session?.user?.email || "",
                                phone: prefill.phone,
                                notes: "",
                            });
                        }}
                        className="w-full text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
                    >
                        {t("signUp")}
                    </button>
                </div>
            )}

            {isFull && myEntries.length === 0 && !signUpForm && (
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 px-4 pb-4 pt-2">
                    {t("fullyBooked")}
                </p>
            )}

            {/* Sign-up form */}
            {signUpForm && !locked && (
                <ShiftEntryForm
                    form={signUpForm}
                    submitting={submitting}
                    error={error}
                    turnstileSiteKey={turnsitleSiteKey}
                    onChange={setSignUpForm}
                    onCancel={() => setSignUpForm(null)}
                    onConfirm={() => handleSignUp(signUpForm)}
                />
            )}
        </>
    );
}
