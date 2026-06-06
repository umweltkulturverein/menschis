"use client";

import { useTranslations } from "next-intl";

interface Props {
    edit?: boolean;
    label: string;
    disabled?: boolean;
    title?: string;
    onClick: () => void;
}

export default function FormTrigger({
    edit,
    label,
    disabled,
    title,
    onClick,
}: Props) {
    const t = useTranslations("Forms");
    if (edit) {
        return (
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                title={title ?? ""}
                aria-label={t("edit")}
                className="hidden group-hover:flex pointer-events-auto cursor-pointer items-center justify-center w-9 h-9 rounded-full bg-white/90 dark:bg-ci-blue-700/90 shadow-md text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-ci-blue-700"
            >
                ✎
            </button>
        );
    }
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className="px-4 py-2 bg-ci-green-500 hover:bg-ci-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
            {label}
        </button>
    );
}
