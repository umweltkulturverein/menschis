"use client";

import { useTranslations } from "next-intl";
import {
    ClientShiftEntry,
    isOwnEntry,
    entryName,
    entryNotes,
    entryAdminFields,
} from "@/types/shift";
import PencilIcon from "@/components/icons/PencilIcon";
import ShiftEntryAdminControls from "./ShiftEntryAdminControls";

interface Props {
    entry: ClientShiftEntry;
    isEditing: boolean;
    adminBusy: boolean;
    shiftStarted: boolean;
    onEdit: (patch: {
        id: number;
        name: string;
        notes: string;
        phone: string;
    }) => void;
    onDelete: (id: number, name: string) => void;
    onToggleCheckIn: (id: number, checkedIn: boolean) => void;
    onAdminNote: (id: number, note: string) => void;
}

export default function ShiftEntryRow({
    entry,
    isEditing,
    adminBusy,
    shiftStarted,
    onEdit,
    onDelete,
    onToggleCheckIn,
    onAdminNote,
}: Props) {
    const t = useTranslations("Entry");
    const ownEntry = isOwnEntry(entry) ? entry : null;
    const displayName = entryName(entry);
    const displayNotes = entryNotes(entry);
    const admin = entryAdminFields(entry);
    const editable =
        ownEntry ??
        (admin && "name" in entry
            ? { id: entry.id, name: entry.name, notes: entry.notes }
            : null);
    // The shift has begun and nobody ticked this person off — only admins can
    // tell, since check-in state never reaches any other viewer.
    const noShow = !!admin && !admin.checkedIn && shiftStarted;
    const ring = isEditing
        ? "ring-1 ring-ci-green-400"
        : noShow
          ? "ring-1 ring-red-400 dark:ring-red-500"
          : "";

    return (
        <div
            title={noShow ? t("notCheckedIn") : undefined}
            className={`flex gap-2 rounded-md px-2.5 py-1.5 ${admin ? "items-start" : "items-center"} ${
                admin?.checkedIn
                    ? "bg-green-50 dark:bg-green-950"
                    : "bg-gray-50 dark:bg-ci-blue-600"
            } ${ring}`}
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

            <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-600 dark:text-gray-300 truncate block">
                    {displayName || t("registered")}
                </span>
                {displayNotes && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 truncate block">
                        {displayNotes}
                    </span>
                )}
                {admin && (
                    <div className="mt-1 flex flex-col gap-0.5 text-[11px] leading-tight text-gray-500 dark:text-gray-400">
                        {admin.phone ? (
                            <a
                                href={`tel:${admin.phone}`}
                                className="truncate hover:underline"
                            >
                                📞 {admin.phone}
                            </a>
                        ) : (
                            <span className="truncate text-gray-400 dark:text-gray-500">
                                📞 {t("noPhone")}
                            </span>
                        )}
                        {admin.email && (
                            <a
                                href={`mailto:${admin.email}`}
                                className="truncate hover:underline"
                            >
                                ✉️ {admin.email}
                            </a>
                        )}
                        <span className="truncate">
                            🕒 {admin.signedUpAt}
                        </span>
                        {!admin.verified && (
                            <span className="w-fit rounded-full bg-amber-100 px-1.5 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                                {t("pending")}
                            </span>
                        )}
                    </div>
                )}
                {admin && (
                    <ShiftEntryAdminControls
                        admin={admin}
                        busy={adminBusy}
                        onToggleCheckIn={() =>
                            onToggleCheckIn(entry.id, !admin.checkedIn)
                        }
                        onSaveNote={(note) =>
                            onAdminNote(entry.id, note)
                        }
                    />
                )}
            </div>
            {editable && (
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() =>
                            onEdit({
                                id: editable.id,
                                name: editable.name,
                                notes: editable.notes,
                                phone: admin?.phone ?? "",
                            })
                        }
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        title={t("edit")}
                    >
                        <PencilIcon className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => onDelete(editable.id, editable.name)}
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
        </div>
    );
}
