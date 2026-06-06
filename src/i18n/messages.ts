import type { Locale } from "./config";

type Messages = Record<string, unknown>;

/**
 * Loads the message catalog for a locale. Usable both inside the request
 * pipeline (see `request.ts`) and in non-request contexts such as email
 * rendering, where `createTranslator` needs messages passed explicitly.
 */
export async function loadMessages(locale: Locale): Promise<Messages> {
    return (await import(`../../messages/${locale}.json`)).default;
}
