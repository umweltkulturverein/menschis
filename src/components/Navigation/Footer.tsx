import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AppName } from "@/lib/misc/vars";

const IMPRINT_URL = "https://organicbeats.org/impressum/";

export default async function Footer() {
    const year = new Date().getFullYear();
    const t = await getTranslations("Footer");

    return (
        <footer className="border-t border-zinc-200 bg-zinc-50 px-6 pt-10 pb-6 text-zinc-600 dark:border-zinc-800 dark:bg-black dark:text-zinc-400">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src="/pics/umku/logo.svg"
                        alt="umweltkulturverein Logo"
                        className="h-12 w-12 dark:invert"
                    />
                    <div>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                            {AppName}
                        </p>
                        <p className="text-sm text-zinc-500">
                            {t("tagline")}
                        </p>
                    </div>
                </div>

                <div className="flex flex-row gap-12 text-sm sm:gap-16">
                    <nav className="flex flex-col gap-2">
                        <span className="font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                            {t("internal")}
                        </span>
                        <Link
                            href="/api/auth/signin"
                            className="transition-colors hover:text-ci-green-400 dark:hover:text-ci-green-300"
                        >
                            {t("teamLogin")}
                        </Link>
                    </nav>

                    <nav className="flex flex-col gap-2">
                        <span className="font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                            {t("infos")}
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-500">
                            {t("sourceCode")}{" "}
                            <i className="text-xs">{t("comingSoon")}</i>
                        </span>
                        <a
                            href={IMPRINT_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-ci-green-400 dark:hover:text-ci-green-300"
                        >
                            {t("imprint")}
                        </a>
                        <Link
                            href="/legal/privacy"
                            className="transition-colors hover:text-ci-green-400 dark:hover:text-ci-green-300"
                        >
                            {t("privacy")}
                        </Link>
                    </nav>
                </div>
            </div>

            <div className="mt-8 border-t border-zinc-200 pt-4 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                {t("copyright", { year })}
            </div>
        </footer>
    );
}
