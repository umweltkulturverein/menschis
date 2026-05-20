import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import EventSummary from "@/components/Events/EventSummary";
import EventForm from "@/components/Events/EventForm";

export default async function EventsPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-ci-blue-800 p-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                Events
            </h1>

            {session && <EventForm />}

            <Suspense
                fallback={
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Loading events…
                    </p>
                }
            >
                <EventSummary />
            </Suspense>
        </div>
    );
}
