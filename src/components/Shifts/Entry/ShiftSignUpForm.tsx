"use client";

import { inputClass, labelClass } from "@/components/Misc/FormModal";

interface EntryForm {
    name: string;
    email: string;
    phone: string;
    notes: string;
}

interface Props {
    form: EntryForm;
    isGuest: boolean;
    submitting: boolean;
    onChange: (form: EntryForm) => void;
    onCancel: () => void;
    onConfirm: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ShiftSignUpForm({
    form,
    isGuest,
    submitting,
    onChange,
    onCancel,
    onConfirm,
}: Props) {
    const trimmedEmail = form.email.trim();
    const emailValid = EMAIL_REGEX.test(trimmedEmail);
    const showEmailError = trimmedEmail.length > 0 && !emailValid;

    return (
        <div className="px-4 pb-4 pt-2 space-y-3">
            <div>
                <label className={labelClass}>Name *</label>
                <input
                    value={form.name}
                    onChange={(e) =>
                        onChange({ ...form, name: e.target.value })
                    }
                    placeholder="Name"
                    required
                    className={inputClass}
                />
            </div>
            <div>
                <label className={labelClass}>E-Mail *</label>
                <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                        onChange({ ...form, email: e.target.value })
                    }
                    placeholder="E-Mail"
                    required
                    aria-invalid={showEmailError}
                    className={inputClass}
                />
                {showEmailError ? (
                    <p className="mt-1 text-xs text-red-500">
                        Bitte gib eine gültige E-Mail-Adresse ein.
                    </p>
                ) : null}
            </div>
            <div>
                <label className={labelClass}>Telefon</label>
                <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                        onChange({ ...form, phone: e.target.value })
                    }
                    placeholder="Telefon (optional)"
                    className={inputClass}
                />
            </div>
            <div>
                <label className={labelClass}>Notiz</label>
                <textarea
                    value={form.notes}
                    onChange={(e) =>
                        onChange({ ...form, notes: e.target.value })
                    }
                    placeholder="Notiz (optional)"
                    rows={2}
                    className={`${inputClass} resize-none`}
                />
            </div>
            {isGuest && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    You{"'"}ll receive an email link to edit and verify your
                    registration.
                </p>
            )}
            <div className="flex gap-2">
                <button
                    onClick={onCancel}
                    className="flex-1 text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-ci-blue-600"
                >
                    Abbrechen
                </button>
                <button
                    onClick={onConfirm}
                    disabled={
                        submitting ||
                        !form.name.trim() ||
                        !emailValid
                    }
                    className="flex-1 text-sm px-3 py-1.5 rounded-md bg-green-500 hover:bg-green-600 text-white font-medium disabled:opacity-50"
                >
                    {submitting ? "..." : "Bestätigen"}
                </button>
            </div>
        </div>
    );
}
