/** URL query-param keys used by the shift filters. Shared by server and client
 *  so the two never drift on how filter state is encoded. */
export const FILTER_KEYS = {
    kind: "kind",
    internal: "internal",
    open: "open",
    day: "day",
    from: "from",
    to: "to",
} as const;

export interface ShiftFilters {
    kindIds: number[];
    internalOnly: boolean;

    openOnly: boolean;

    dayIds: number[];

    /** Time Range Slider */
    fromMinute: number | null;
    toMinute: number | null;
}

export const EMPTY_FILTERS: ShiftFilters = {
    kindIds: [],
    internalOnly: false,
    openOnly: false,
    dayIds: [],
    fromMinute: null,
    toMinute: null,
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
        openOnly: get(FILTER_KEYS.open) === "1",
        dayIds: nums(FILTER_KEYS.day),
        fromMinute: num(FILTER_KEYS.from),
        toMinute: num(FILTER_KEYS.to),
    };
}

/** Local midnight (ms) of a date — the zero point a day's times are measured
 *  from. */
function midnightMs(d: Date): number {
    const m = new Date(d);
    m.setHours(0, 0, 0, 0);
    return m.getTime();
}

/** Base day (local midnight) per group — the zero point that group's times
 *  are measured from, derived from the *earliest shift start* in the group.
 *  Shifts are grouped by event day (`eventDayId`)
 *  all day-less shifts share the `null` group. Measuring from the
 *  base day with the real datetime keeps a group running 14:00→02:00 contiguous:
 *  the 02:00 start becomes 1560 (past midnight) instead of wrapping back to 120. */
export type BaseDays = Map<number | null, number>;

export function computeBaseDays(
    rows: { startDatetime: Date; eventDayId: number | null }[],
): BaseDays {
    const earliest = new Map<number | null, number>();
    for (const r of rows) {
        const t = new Date(r.startDatetime).getTime();
        const cur = earliest.get(r.eventDayId);
        if (cur === undefined || t < cur) earliest.set(r.eventDayId, t);
    }
    const baseDays: BaseDays = new Map();
    for (const [key, t] of earliest) baseDays.set(key, midnightMs(new Date(t)));
    return baseDays;
}

/** Minutes from the group's base day. Uses the real datetime, so times past
 *  midnight extend beyond MINUTES_PER_DAY rather than wrapping. Falls back to the
 *  timestamp's own midnight when the group has no base day. */
function minuteOnAxis(
    when: Date,
    eventDayId: number | null,
    baseDays: BaseDays,
): number {
    const t = new Date(when);
    const baseDay = baseDays.get(eventDayId) ?? midnightMs(t);
    return Math.round((t.getTime() - baseDay) / 60000);
}

/** Slider domain: first start → last start, every shift mapped onto a single day
 *  timeline (each group measured from its base day) so days that cross midnight
 *  overlay cleanly and a 02:00 start lands at the end. Filtering is by start, so
 *  only start times bound the track — end times never widen it. */
export function computeTimeAxis(
    rows: { startDatetime: Date; eventDayId: number | null }[],
    baseDays: BaseDays,
): { minMinute: number; maxMinute: number } | null {
    if (!rows.length) return null;
    const starts = rows.map((r) =>
        minuteOnAxis(r.startDatetime, r.eventDayId, baseDays),
    );
    return { minMinute: Math.min(...starts), maxMinute: Math.max(...starts) };
}

/** Does a shift *start* within the selected window? Mapped onto the same base-day
 *  timeline as the axis, so a 14:00→02:00 window matches the late start on every
 *  day. */
export function shiftInTimeWindow(
    shift: { startDatetime: Date; eventDayId: number | null },
    fromMinute: number | null,
    toMinute: number | null,
    baseDays: BaseDays,
): boolean {
    if (fromMinute === null && toMinute === null) return true;
    const start = minuteOnAxis(shift.startDatetime, shift.eventDayId, baseDays);
    return start >= (fromMinute ?? -Infinity) && start <= (toMinute ?? Infinity);
}

/** Format an axis minute as HH:MM (time only — the day is filtered separately). */
export function formatMinute(min: number): string {
    const m = ((min % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
        m % 60,
    ).padStart(2, "0")}`;
}
