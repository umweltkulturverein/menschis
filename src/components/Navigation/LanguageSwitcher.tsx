"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { setUserLocale } from "@/i18n/locale-actions";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/i18n/config";

export default function LanguageSwitcher() {
    const locale = useLocale() as Locale;
    const t = useTranslations("Nav");
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    function select(next: Locale) {
        setOpen(false);
        if (next === locale) return;
        startTransition(async () => {
            await setUserLocale(next);
            router.refresh();
        });
    }

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                disabled={isPending}
                aria-label={t("language")}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ci-green-500 disabled:opacity-50"
            >
                {/* Globe */}
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18"
                    />
                </svg>
                <span className="hidden sm:inline uppercase">{locale}</span>
                {/* Chevron */}
                <svg
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {open && (
                <ul
                    role="listbox"
                    className="absolute right-0 mt-1.5 min-w-36 overflow-hidden rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-ci-blue-700 shadow-xl shadow-black/10 py-1 z-50"
                >
                    {LOCALES.map((l) => (
                        <li key={l}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={l === locale}
                                onClick={() => select(l)}
                                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-white/5 ${
                                    l === locale
                                        ? "text-gray-900 dark:text-white font-medium"
                                        : "text-gray-600 dark:text-gray-300"
                                }`}
                            >
                                {LOCALE_NAMES[l]}
                                {l === locale && (
                                    <span className="text-ci-green-400">✓</span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
