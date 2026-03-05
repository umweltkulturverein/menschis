import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignInButton from "./SignInButton";

export default async function NavBar() {
    const session = await getServerSession(authOptions);

    return (
        <nav className="w-full bg-white dark:bg-black p-4 shadow-md">
            <div className="max-w-screen mx-auto flex items-center justify-between">
                <div className="flex items-center">
                    <img
                        className="h-10 w-10 dark:invert"
                        src="/pics/umku/logo.svg"
                        alt="umku logo"
                    />
                    <span className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">
                        umku
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {session ? (
                        <>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                {session.user?.name ?? session.user?.email}
                            </span>
                            <a
                                href="/api/auth/signout"
                                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                Sign out
                            </a>
                        </>
                    ) : (
                        <SignInButton />
                    )}
                </div>
            </div>
        </nav>
    );
}
