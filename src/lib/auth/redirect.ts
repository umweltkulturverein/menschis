function appBase(): URL {
    return new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000");
}

function parseSameOrigin(target: string | null | undefined): URL | undefined {
    if (!target) return undefined;
    const base = appBase();
    try {
        const url = new URL(target, base);
        if (url.origin !== base.origin) return undefined;
        // "//host" would turn into another origin when resolved again later.
        if (url.pathname.startsWith("//")) return undefined;
        return url;
    } catch {
        return undefined;
    }
}

/** Path of `target` if it resolves to this app's origin, otherwise undefined. */
export function sameOriginPath(
    target: string | null | undefined,
): string | undefined {
    const url = parseSameOrigin(target);
    return url && url.pathname + url.search + url.hash;
}

/** Absolute redirect URL on this app's origin; falls back to "/". */
export function safeRedirectUrl(target: string | null | undefined): URL {
    return parseSameOrigin(target) ?? new URL("/", appBase());
}
