"use server";

import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE, type Locale } from "./config";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setUserLocale(locale: Locale): Promise<void> {
    if (!isLocale(locale)) return;
    (await cookies()).set(LOCALE_COOKIE, locale, {
        path: "/",
        maxAge: ONE_YEAR,
        sameSite: "lax",
    });
}
