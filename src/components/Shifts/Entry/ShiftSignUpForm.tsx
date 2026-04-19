"use client";

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

export default function ShiftSignUpForm({
    form,
    isGuest,
    submitting,
    onChange,
    onCancel,
    onConfirm,
}: Props) {
    return (
        <div className="px-4 pb-4 pt-2 space-y-2">
            <input
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                placeholder="Name"
                required
                className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-ci-blue-600 text-gray-800 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
                type="email"
                value={form.email}
                onChange={(e) => onChange({ ...form, email: e.target.value })}
                placeholder="E-Mail"
                required
                className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-ci-blue-600 text-gray-800 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
                type="tel"
                value={form.phone}
                onChange={(e) => onChange({ ...form, phone: e.target.value })}
                placeholder="Telefon (optional)"
                className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-ci-blue-600 text-gray-800 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <textarea
                value={form.notes}
                onChange={(e) => onChange({ ...form, notes: e.target.value })}
                placeholder="Notiz (optional)"
                rows={2}
                className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-ci-blue-600 text-gray-800 dark:text-white px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            />
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
                        !form.email.trim()
                    }
                    className="flex-1 text-sm px-3 py-1.5 rounded-md bg-green-500 hover:bg-green-600 text-white font-medium disabled:opacity-50"
                >
                    {submitting ? "..." : "Bestätigen"}
                </button>
            </div>
        </div>
    );
}
