import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, RedirectType } from "next/navigation";
import { GetEvent } from "@/lib/db/events";
import EventBanner from "@/components/Events/EventBanner";
import { Suspense } from "react";
import ShiftSummary from "@/components/Shifts/ShiftSummary";
import Link from "next/link";

export default async function EventPage({
    params,
}: {
    params: Promise<{ event: string }>;
}) {
    const { event: eventId } = await params;
    const session = await getServerSession(authOptions);
    const event = await GetEvent(Number(eventId));
    if (event === undefined) {
        redirect("/404", RedirectType.replace);
    }
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-ci-blue-800">
            <EventBanner event={event} />
            <div className="max-w-4xl mx-auto px-6 py-8">
                {session && (
                    <div className="flex justify-end mb-4">
                        <Link
                            href={`/events/${eventId}/edit`}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-ci-blue-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm hover:shadow transition-all cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3a2 2 0 01.586-1.414z" />
                            </svg>
                            Edit
                        </Link>
                    </div>
                )}
                <Suspense
                    fallback={
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Loading shifts…
                        </p>
                    }
                >
                    <ShiftSummary eventId={event.id} />
                </Suspense>
            </div>
        </div>
    );
}
