"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
    return (
        <button
            onClick={() => signIn("oidc")}
            className="px-3 py-1.5 text-sm bg-ci-green-500 hover:bg-ci-green-600 text-white rounded-md transition-colors cursor-pointer"
        >
            Sign in
        </button>
    );
}
