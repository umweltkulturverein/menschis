// Shift and event times are wall clocks, not instants: 14:00 means 14:00 at the
// venue. They are never converted, so entered time == stored time == displayed
// time regardless of server or browser timezone.

/** A naive wall clock, "YYYY-MM-DDTHH:MM". No zone attached, ever. */
export type WallClock = string;

const PARTS = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/;

/** Accepts pg's "2026-08-28 14:00:00" or a form's "2026-08-28T14:00". */
export function toWall(value: string | null | undefined): WallClock {
    if (!value) return "";
    const m = PARTS.exec(value);
    return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}` : "";
}

/** Ordering/diffing key in minutes. Only ever compared to another wall clock. */
export function wallMinutes(w: WallClock): number {
    const m = PARTS.exec(w);
    if (!m) return NaN;
    return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) / 60000;
}

/** "14:00" */
export function wallTime(w: WallClock): string {
    const m = PARTS.exec(w);
    return m ? `${m[4]}:${m[5]}` : "";
}

/** "2026-08-28" */
export function wallDay(w: WallClock): string {
    return toWall(w).slice(0, 10);
}

/** Same calendar day? */
export function sameWallDay(a: WallClock, b: WallClock): boolean {
    return wallDay(a) === wallDay(b) && wallDay(a) !== "";
}

/** Calendar carrier for Intl formatting. Pinned to UTC so the fields come back
 *  exactly as written — format it with { timeZone: "UTC" } and nothing shifts. */
export function wallCalendar(w: WallClock): Date {
    const m = PARTS.exec(w);
    if (!m) return new Date(NaN);
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
}

/** Localised date, e.g. "28. Aug.". Options are forced to the UTC frame. */
export function wallDateString(
    w: WallClock,
    locale: string,
    options: Intl.DateTimeFormatOptions,
): string {
    if (!toWall(w)) return "";
    return wallCalendar(w).toLocaleDateString(locale, {
        ...options,
        timeZone: "UTC",
    });
}

/** Wall clock of the current moment, read from the local calendar. */
export function nowWall(): WallClock {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
