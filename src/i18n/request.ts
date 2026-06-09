import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, matchAcceptLanguage } from "./config";
import { loadMessages } from "./messages";

export default getRequestConfig(async () => {
    const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
    const locale = isLocale(cookieLocale)
        ? cookieLocale
        : matchAcceptLanguage((await headers()).get("accept-language")) ??
          DEFAULT_LOCALE;

    return {
        locale,
        messages: await loadMessages(locale),
    };
});
