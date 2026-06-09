// Add a new language by dropping a `messages/<locale>.json` file and listing the
// locale here (plus a display name). Nothing else needs to change.
export const LOCALES = ["de", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "de";

export const LOCALE_NAMES: Record<Locale, string> = {
    de: "Deutsch",
    en: "English",
};

export const LOCALE_COOKIE = "NEXT_LOCALE";

// BCP-47 tags used for date/time formatting per locale (24h clock kept for both).
export const DATE_LOCALE: Record<Locale, string> = {
    de: "de-DE",
    en: "en-GB",
};

export function isLocale(value: string | undefined | null): value is Locale {
    return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Pick the best supported locale from an `Accept-Language` header value. */
export function matchAcceptLanguage(header: string | null): Locale | undefined {
    if (!header) return undefined;
    const tags = header
        .split(",")
        .map((part) => {
            const [tag, q] = part.trim().split(";q=");
            return { base: tag.split("-")[0]?.toLowerCase(), q: q ? Number(q) : 1 };
        })
        .sort((a, b) => b.q - a.q);
    for (const { base } of tags) {
        if (isLocale(base)) return base;
    }
    return undefined;
}
