import { NaturalDateTime } from "@/lib/misc/contextAwareDates";
import { EventItem } from "@/types/event";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

interface Props {
    event: EventItem;
}

export default async function EventPanel({ event }: Props) {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const t = await getTranslations("Events");

    return (
        <Link href={`/events/${event.id}`} className="block">
            <div className="rounded-lg p-4 shadow-md bg-white dark:bg-ci-blue-700 hover:shadow-lg transition-shadow duration-200">
                <div className="w-full h-32 mb-3 rounded-md overflow-hidden bg-gradient-to-r from-ci-green-100 to-ci-green-200 dark:from-ci-green-500 dark:to-ci-green-600 flex items-center justify-center">
                    <svg
                        className="w-12 h-12 text-ci-green-500 dark:text-ci-green-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                    </svg>
                </div>

                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                        {event.title}
                    </h1>
                    {event.public ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 shrink-0 ml-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 inline-block" />
                            {t("visible")}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-yellow-600 dark:text-yellow-400 shrink-0 ml-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 dark:bg-yellow-400 inline-block" />
                            {t("editorMode")}
                        </span>
                    )}
                </div>

                {event.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm line-clamp-3">
                        {event.description}
                    </p>
                )}

                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <div>
                        <span className="text-ci-green-400 dark:text-ci-green-300">
                            {t("start")}{" "}
                        </span>
                        <span>{NaturalDateTime(startDate)}</span>
                    </div>
                    <div>
                        <span className="text-ci-green-400 dark:text-ci-green-300">
                            {t("end")}{" "}
                        </span>
                        <span>{NaturalDateTime(endDate)}</span>
                    </div>
                </div>

                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <svg
                        className="w-4 h-4 mr-1 text-green-500 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                        {event.location}
                    </span>
                </div>
            </div>
        </Link>
    );
}
