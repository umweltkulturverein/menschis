/** URL query-param keys used by the shift filters. Shared by server and client
 *  so the two never drift on how filter state is encoded. */
export const FILTER_KEYS = {
    kind: "kind",
    internal: "internal",
    day: "day",
    from: "from",
    to: "to",
} as const;

export interface ShiftFilters {
    /** Selected shiftKind ids. Empty = all kinds. */
    kindIds: number[];
    /** Internal users only: show internal shifts exclusively. */
    internalOnly: boolean;
    /** Selected eventDay ids. Empty = all days. */
    dayIds: number[];
    /** Lower bound of the time-of-day window, in minutes. null = no bound. */
    fromMin: number | null;
    /** Upper bound of the time-of-day window, in minutes. null = no bound. */
    toMin: number | null;
}

export const EMPTY_FILTERS: ShiftFilters = {
    kindIds: [],
    internalOnly: false,
    dayIds: [],
    fromMin: null,
    toMin: null,
};

export const MINUTES_PER_DAY = 24 * 60;

/** Parse filters from any param source exposing a `get(key)` reader.
 *  Server passes a reader over the awaited searchParams record; the client
 *  passes `useSearchParams().get`. */
export function parseFilters(
    get: (key: string) => string | null | undefined,
): ShiftFilters {
    const nums = (key: string) =>
        get(key)
            ?.split(",")
            .map(Number)
            .filter((n) => !Number.isNaN(n)) ?? [];
    const num = (key: string) => {
        const v = get(key);
        return v ? Number(v) : null;
    };

    return {
        kindIds: nums(FILTER_KEYS.kind),
        internalOnly: get(FILTER_KEYS.internal) === "1",
        dayIds: nums(FILTER_KEYS.day),
        fromMin: num(FILTER_KEYS.from),
        toMin: num(FILTER_KEYS.to),
    };
}

/** Minute-of-day (0–1439) for a timestamp, in the server's local zone. */
export function minuteOfDay(d: Date): number {
    return d.getHours() * 60 + d.getMinutes();
}

/** Slider domain: earliest start → latest end, so the track always has range
 *  even when every shift starts at the same time. Filtering is still by start. */
export function computeTimeAxis(
    rows: { startDatetime: Date; endDatetime: Date }[],
): { minMin: number; maxMin: number } | null {
    if (!rows.length) return null;
    const starts = rows.map((r) => minuteOfDay(new Date(r.startDatetime)));
    const ends = rows.map((r) => minuteOfDay(new Date(r.endDatetime)));
    const minMin = Math.min(...starts);
    let maxMin = Math.max(...ends);
    // Guard against zero-length shifts / ends that wrap past midnight.
    if (maxMin <= minMin) maxMin = Math.max(...starts);
    return { minMin, maxMin };
}

/** Does a shift *start* within the selected window? Date-agnostic, so a
 *  14:00–16:00 window matches shifts starting in that slot on every day. */
export function shiftInTimeWindow(
    shift: { startDatetime: Date },
    fromMin: number | null,
    toMin: number | null,
): boolean {
    if (fromMin === null && toMin === null) return true;
    const start = minuteOfDay(new Date(shift.startDatetime));
    return start >= (fromMin ?? -Infinity) && start <= (toMin ?? Infinity);
}

/** Format an axis minute as HH:MM (time only — the day is filtered separately). */
export function formatMinute(min: number): string {
    const m = ((min % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
        m % 60,
    ).padStart(2, "0")}`;
}
