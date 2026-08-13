"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { AdminEntryFields } from "@/types/shift";
import CheckIcon from "@/components/icons/CheckIcon";
import PencilIcon from "@/components/icons/PencilIcon";
import FormActions from "@/components/Misc/Form/FormActions";
import { inputClass, labelClass } from "@/components/Misc/Form/FormModal";

interface Props {
    admin: AdminEntryFields;
    busy: boolean;
    onToggleCheckIn: () => void;
    onSaveNote: (note: string) => void;
}

/** The admin-only controls under an entry on the event dashboard: the check-in
 *  toggle and the note nobody but admins gets to see. Only ever rendered when
 *  `projectEntry` handed out the admin fields, so no gate of its own. */
export default function ShiftEntryAdminControls({
    admin,
    busy,
    onToggleCheckIn,
    onSaveNote,
}: Props) {
    const t = useTranslations("Entry");
    // null while not editing; the draft text otherwise (empty string included).
    const [draft, setDraft] = useState<string | null>(null);

    function confirm() {
        if (draft === null) return;
        onSaveNote(draft);
        setDraft(null);
    }

    return (
        <div className="mt-1.5 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
                <button
                    onClick={onToggleCheckIn}
                    disabled={busy}
                    title={admin.checkedIn ? t("undoCheckIn") : t("checkIn")}
                    className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-50 cursor-pointer ${
                        admin.checkedIn
                            ? "border-green-300 bg-green-100 text-green-800 hover:bg-green-200 dark:border-green-700 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                            : "border-gray-300 text-gray-500 hover:border-green-400 hover:text-green-700 dark:border-gray-500 dark:text-gray-400 dark:hover:border-green-600 dark:hover:text-green-300"
                    }`}
                >
                    <CheckIcon className="w-3 h-3" />
                    {admin.checkedIn ? t("checkedIn") : t("checkIn")}
                </button>
                {admin.checkedIn && admin.checkedInAt && (
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                        {admin.checkedInAt}
                    </span>
                )}
                {draft === null && !admin.adminNote && (
                    <button
                        onClick={() => setDraft("")}
                        className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    >
                        <PencilIcon className="w-3 h-3" />
                        {t("addAdminNote")}
                    </button>
                )}
            </div>

            {draft !== null ? (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2.5 dark:border-green-800 dark:bg-green-950">
                    <label className={labelClass}>{t("adminNote")}</label>
                    <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        rows={2}
                        autoFocus
                        placeholder={t("adminNotePlaceholder")}
                        className={`${inputClass} resize-none`}
                    />
                    <div className="mt-2">
                        <FormActions
                            cancelLabel={t("cancel")}
                            confirmLabel={t("confirm")}
                            submitting={busy}
                            onCancel={() => setDraft(null)}
                            onConfirm={confirm}
                        />
                    </div>
                </div>
            ) : (
                admin.adminNote && (
                    <button
                        onClick={() => setDraft(admin.adminNote)}
                        title={t("editAdminNote")}
                        className="group/note flex w-full items-start gap-1.5 rounded-md border border-green-200 bg-green-50 px-2 py-1.5 text-left dark:border-green-800 dark:bg-green-950 cursor-pointer"
                    >
                        <span className="flex-1 whitespace-pre-wrap text-[11px] leading-snug text-green-900 dark:text-green-100">
                            {admin.adminNote}
                        </span>
                        <PencilIcon className="mt-0.5 w-3 h-3 shrink-0 text-green-600 opacity-0 transition-opacity group-hover/note:opacity-100 dark:text-green-400" />
                    </button>
                )
            )}
        </div>
    );
}
