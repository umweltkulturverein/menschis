"use client";

import { useTranslations } from "next-intl";
import { ClientShiftEntry, isOwnEntry } from "@/types/shift";

interface Props {
    entry: ClientShiftEntry;
    editing: { id: number; name: string; notes: string } | null;
    submitting: boolean;
    onEdit: (patch: { id: number; name: string; notes: string }) => void;
    onEditChange: (patch: { id: number; name: string; notes: string }) => void;
    onEditCancel: () => void;
    onEditConfirm: () => void;
    onDelete: (id: number, name: string) => void;
}

export default function ShiftEntryRow({
    entry,
    editing,
    submitting,
    onEdit,
    onEditChange,
    onEditCancel,
    onEditConfirm,
    onDelete,
}: Props) {
    const t = useTranslations("Entry");
    const ownEntry = isOwnEntry(entry) ? entry : null;
    const isEditing = editing?.id === entry.id;

    return (
        <div className="flex items-center gap-2 rounded-md bg-gray-50 dark:bg-ci-blue-600 px-2.5 py-1.5">
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
                            onEditChange({ ...editing, name: e.target.value })
                        }
                        placeholder={t("name")}
                        className="flex-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-ci-blue-700 text-gray-800 dark:text-white px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <div className="flex gap-1">
                        <input
                            value={editing.notes}
                            onChange={(e) =>
                                onEditChange({
                                    ...editing,
                                    notes: e.target.value,
                                })
                            }
                            placeholder={t("notePlaceholder")}
                            className="flex-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-ci-blue-700 text-gray-800 dark:text-white px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                        <button
                            onClick={onEditConfirm}
                            disabled={submitting}
                            className="text-xs text-green-600 dark:text-green-400 hover:underline disabled:opacity-50"
                        >
                            OK
                        </button>
                        <button
                            onClick={onEditCancel}
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
                            {ownEntry ? ownEntry.name || t("registered") : t("registered")}
                        </span>
                        {ownEntry?.notes && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 truncate block">
                                {ownEntry.notes}
                            </span>
                        )}
                    </div>
                    {ownEntry && (
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={() =>
                                    onEdit({
                                        id: ownEntry.id,
                                        name: ownEntry.name,
                                        notes: ownEntry.notes,
                                    })
                                }
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                title={t("edit")}
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
                                onClick={() => onDelete(ownEntry.id, ownEntry.name)}
                                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                title={t("signOff")}
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
}
