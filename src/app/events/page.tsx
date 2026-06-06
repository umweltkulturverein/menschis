import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth/nextauth";
import EventSummary from "@/components/Events/EventSummary";
import EventForm from "@/components/Events/EventForm";

export default async function EventsPage() {
    const session = await getServerSession(authOptions);
    const t = await getTranslations("Events");

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-ci-blue-800 p-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                {t("title")}
            </h1>

            {session && <EventForm />}

            <Suspense
                fallback={
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {t("loading")}
                    </p>
                }
            >
                <EventSummary
                session={session}
                />
            </Suspense>
        </div>
    );
}
