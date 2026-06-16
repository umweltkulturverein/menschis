"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CheckIcon from "@/components/icons/CheckIcon";
import CopyIcon from "@/components/icons/CopyIcon";

export default function CopyButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    const t = useTranslations("Forms");

    async function handleCopy() {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-ci-blue-600 transition-colors"
        >
            {copied ? (
                <>
                    <CheckIcon className="w-3.5 h-3.5 text-green-500" />
                    {t("copied")}
                </>
            ) : (
                <>
                    <CopyIcon className="w-3.5 h-3.5" />
                    {t("copy")}
                </>
            )}
        </button>
    );
}
