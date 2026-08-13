import type { ReactNode } from "react";

interface Props {
    label: string;
    value: number;
    /** When given, the tile reads as a ratio: `value/total`, a percentage and a
     *  meter. Omit it for a bare count. */
    total?: number;
    /** Shown beside the label. Status tones carry an icon so the state never
     *  rests on colour alone. */
    icon?: ReactNode;
    /** Muted by default; `alert` only earns its colour once the count is > 0. */
    tone?: "default" | "alert";
}

/** One tile of the dashboard KPI row. Two shapes out of one component: a ratio
 *  with a meter when `total` is set, a plain count when it is not. */
export default function StatPanel({
    label,
    value,
    total,
    icon,
    tone = "default",
}: Props) {
    const isRatio = total !== undefined;
    const percent = isRatio && total > 0 ? Math.round((value / total) * 100) : 0;
    const alert = tone === "alert" && value > 0;

    return (
        <div className="rounded-lg bg-white dark:bg-ci-blue-700 shadow-md px-4 py-3">
            <div className="flex items-center gap-1.5">
                {icon && (
                    <span
                        className={
                            alert
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-gray-400 dark:text-gray-500"
                        }
                    >
                        {icon}
                    </span>
                )}
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {label}
                </span>
            </div>

            <div className="mt-1 flex items-baseline justify-between gap-2">
                {/* Proportional figures: tabular-nums makes a large standalone
                    number look loose. */}
                <span
                    className={`text-2xl font-semibold leading-none ${
                        alert
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-gray-800 dark:text-white"
                    }`}
                >
                    {value}
                    {isRatio && (
                        <span className="text-base font-normal text-gray-400 dark:text-gray-500">
                            /{total}
                        </span>
                    )}
                </span>
                {isRatio && (
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {percent}%
                    </span>
                )}
            </div>

            {isRatio && (
                // Meter track is a lighter step of the fill's own ramp, so the
                // bar reads as one object rather than a bar on a grey slab.
                <div
                    className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ci-green-100 dark:bg-ci-green-600"
                    role="img"
                    aria-label={`${value}/${total} (${percent}%)`}
                >
                    <div
                        className="h-full rounded-full bg-ci-green-400 dark:bg-ci-green-300 transition-[width] duration-500"
                        style={{ width: `${Math.min(100, percent)}%` }}
                    />
                </div>
            )}
        </div>
    );
}
