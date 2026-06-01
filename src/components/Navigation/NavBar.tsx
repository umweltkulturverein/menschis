import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import Link from "next/link";

export default async function NavBar() {
    const session = await getServerSession(authOptions);

    return (
        <nav className="w-full sticky top-0 z-50 bg-white/70 dark:bg-black/60 backdrop-blur-md p-4 shadow-md">
            <div className="max-w-screen mx-auto flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/events" className="flex items-center">
                        <img
                            className="h-10 w-10 dark:invert"
                            src="/pics/umku/logo.svg"
                            alt="umku logo"
                        />
                        <span className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">
                            Menschis - Helfer*innen Tool
                        </span>
                    </Link>
                    <Link
                        href="/events"
                        className="px-6 py-1.5 text-m text- font-medium text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Events
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    {session && (
                        <>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                {session.user?.name ?? session.user?.email}
                            </span>
                            <Link
                                href="/api/auth/signout"
                                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                Sign out
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
