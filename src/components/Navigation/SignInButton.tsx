"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function SignInButton() {
    const t = useTranslations("Nav");
    return (
        <button
            onClick={() => signIn("oidc")}
            className="px-3 py-1.5 text-sm bg-ci-green-500 hover:bg-ci-green-600 text-white rounded-md transition-colors cursor-pointer"
        >
            {t("signIn")}
        </button>
    );
}
