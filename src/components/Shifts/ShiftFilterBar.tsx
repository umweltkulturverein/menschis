"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ShiftKind } from "@/types/shift";
import { EventDay } from "@/types/eventDay";
import { FILTER_KEYS, formatMinute, parseFilters } from "@/lib/shifts/filters";
import {StringToColour} from "@/lib/misc/color";

const STEP = 30; // minutes

interface Props {
    kinds: ShiftKind[];
    days: EventDay[];
    bounds: { minMin: number; maxMin: number } | null;
    showInternal: boolean;
}

function parseNums(v: string | null): number[] {
    return (
        v
            ?.split(",")
            .map(Number)
            .filter((n) => !Number.isNaN(n)) ?? []
    );
}

/** Close `onDismiss` when clicking outside `ref`. */
function useOutsideClose(
    ref: React.RefObject<HTMLElement | null>,
    onDismiss: () => void,
) {
    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onDismiss();
            }
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [ref, onDismiss]);
}

export default function ShiftFilterBar({
    kinds,
    days,
    bounds,
    showInternal,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();
    const filters = parseFilters((k) => sp.get(k));
    const [mobileOpen, setMobileOpen] = useState(false);

    function commit(next: URLSearchParams) {
        const qs = next.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }

    function toggleNum(key: string, id: number) {
        const next = new URLSearchParams(sp);
        const set = new Set(parseNums(sp.get(key)));
        if (set.has(id)) set.delete(id);
        else set.add(id);
        if (set.size) next.set(key, [...set].join(","));
        else next.delete(key);
        commit(next);
    }

    function setInternal(on: boolean) {
        const next = new URLSearchParams(sp);
        if (on) next.set(FILTER_KEYS.internal, "1");
        else next.delete(FILTER_KEYS.internal);
        commit(next);
    }

    const hasFilters =
        filters.kindIds.length > 0 ||
        filters.dayIds.length > 0 ||
        filters.internalOnly ||
        filters.fromMin !== null ||
        filters.toMin !== null;

    const showSlider = bounds && bounds.maxMin - bounds.minMin > STEP;

    const activeCount =
        filters.kindIds.length +
        filters.dayIds.length +
        (filters.internalOnly ? 1 : 0) +
        (filters.fromMin !== null || filters.toMin !== null ? 1 : 0);

    return (
        <div className="relative z-30 mb-6">
        <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex w-full items-center gap-2 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-ci-blue-700/50 backdrop-blur-sm shadow-sm ring-1 ring-black/[0.03] dark:ring-white/5 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer md:hidden"
        >
            <svg
                className="h-4 w-4 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4h18M6 10h12M10 16h4"
                />
            </svg>
            Filter
            {activeCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ci-green-300 px-1 text-xs font-semibold text-ci-blue-800">
                    {activeCount}
                </span>
            )}
            <svg
                className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${
                    mobileOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        </button>
        <div
            className={`${
                mobileOpen ? "flex" : "hidden"
            } mt-2 md:mt-0 md:flex w-fit max-w-full flex-wrap items-center gap-x-3 gap-y-3 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-ci-blue-700/50 backdrop-blur-sm shadow-sm ring-1 ring-black/[0.03] dark:ring-white/5 px-4 py-3`}
        >
            <MultiSelectSearch
                options={kinds.map((k) => ({
                    id: k.id,
                    label: k.title,
                    color: k.color,
                }))}
                selected={filters.kindIds}
                onToggle={(id) => toggleNum(FILTER_KEYS.kind, id)}
                placeholder="Schichtarten suchen…"
                emptyText="Keine passenden Schichtarten"
            />

            {days.length > 0 && (
                <>
                    <Divider />
                    <MultiSelectSearch
                        options={days.map((d) => ({
                            id: d.id,
                            label: d.dayTitle,
                            color: StringToColour(d.dayTitle)
                        }))}
                        selected={filters.dayIds}
                        onToggle={(id) => toggleNum(FILTER_KEYS.day, id)}
                        placeholder="Tage suchen…"
                        emptyText="Keine passenden Tage"
                    />
                </>
            )}

            {showSlider && (
                <>
                    <Divider />
                    <div className="flex shrink-0 items-center">
                        <TimeRangeSlider
                            key={`${filters.fromMin}-${filters.toMin}`}
                            bounds={bounds}
                            fromMin={filters.fromMin}
                            toMin={filters.toMin}
                            onCommit={(from, to) => {
                                const next = new URLSearchParams(sp);
                                if (from > bounds.minMin)
                                    next.set(FILTER_KEYS.from, String(from));
                                else next.delete(FILTER_KEYS.from);
                                if (to < bounds.maxMin)
                                    next.set(FILTER_KEYS.to, String(to));
                                else next.delete(FILTER_KEYS.to);
                                commit(next);
                            }}
                        />
                    </div>
                </>
            )}

            {showInternal && (
                <div className="flex shrink-0 items-center gap-x-3">
                    <Divider />
                    <Switch
                        checked={filters.internalOnly}
                        onChange={setInternal}
                        label="Nur interne Schichten"
                    />
                </div>
            )}
        </div>
        {hasFilters && (
            <button
                type="button"
                onClick={() => commit(new URLSearchParams())}
                className={`${
                    mobileOpen ? "block" : "hidden"
                } md:block mt-2 ml-1 text-xs font-medium text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer`}
            >
                Zurücksetzen
            </button>
        )}
        </div>
    );
}

function Divider() {
    return (
        <span className="hidden h-8 shrink-0 lg:block w-px bg-gray-200/70 dark:bg-white/10" />
    );
}

interface SelectOption {
    id: number;
    label: string;
    /** Optional hex colour; renders a dot before the label when present. */
    color?: string;
}

/** Search field + dropdown for multi-selecting options; selected ones become
 *  removable chips inside the field. Shared by the kind and day filters. */
function MultiSelectSearch({
    options,
    selected,
    onToggle,
    placeholder,
    emptyText,
}: {
    options: SelectOption[];
    selected: number[];
    onToggle: (id: number) => void;
    placeholder: string;
    emptyText: string;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    useOutsideClose(ref, () => setOpen(false));

    const selectedOptions = options.filter((o) => selected.includes(o.id));
    const visible = options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase()),
    );

    return (
        <div ref={ref} className="relative shrink-0">
            <div
                onClick={() => setOpen(true)}
                className="flex min-h-9 w-64 flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-ci-blue-800/60 px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-ci-green-300/60 focus-within:border-ci-green-300 transition-shadow"
            >
                {selectedOptions.map((o) => (
                    <span
                        key={o.id}
                        className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 dark:bg-white/10 pl-1.5 pr-1 py-0.5 text-xs text-gray-700 dark:text-gray-100"
                    >
                        {o.color && (
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: o.color }}
                            />
                        )}
                        {o.label}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle(o.id);
                            }}
                            className="text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer leading-none"
                            aria-label={`${o.label} entfernen`}
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={query}
                    placeholder={selectedOptions.length ? "" : placeholder}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    className="min-w-[5rem] flex-1 bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none"
                />
            </div>

            {open && (
                <ul className="absolute z-30 mt-1.5 w-72 max-h-64 overflow-auto rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-ci-blue-700 shadow-xl shadow-black/10 py-1">
                    {visible.length === 0 && (
                        <li className="px-3 py-2 text-sm text-gray-400">
                            {emptyText}
                        </li>
                    )}
                    {visible.map((o) => {
                        const active = selected.includes(o.id);
                        return (
                            <li key={o.id}>
                                <button
                                    type="button"
                                    onClick={() => onToggle(o.id)}
                                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-left text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5"
                                >
                                    {o.color && (
                                        <span
                                            className="h-2.5 w-2.5 rounded-full shrink-0 ring-2 ring-white dark:ring-ci-blue-700"
                                            style={{ backgroundColor: o.color }}
                                        />
                                    )}
                                    <span className="flex-1 truncate">
                                        {o.label}
                                    </span>
                                    {active && (
                                        <span className="text-ci-green-300 font-semibold">
                                            ✓
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

/** Squared toggle switch wrapped in a chip that lights up when active. */
function Switch({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: (on: boolean) => void;
    label: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-1.5 transition-all cursor-pointer select-none ${
                checked
                    ? "border-indigo-300/70 bg-indigo-50 dark:border-indigo-500/40 dark:bg-indigo-900/30 ring-2 ring-indigo-300/30 dark:ring-indigo-500/20"
                    : "border-gray-200 dark:border-white/10 bg-white dark:bg-ci-blue-800/60 hover:border-gray-300 dark:hover:border-white/20"
            }`}
        >
            <span
                className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                    checked
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-gray-500 dark:text-gray-400"
                }`}
            >
                {label}
            </span>
            <span
                className={`relative h-6 w-11 rounded-md transition-colors ${
                    checked
                        ? "bg-indigo-500"
                        : "bg-gray-200 dark:bg-white/15"
                }`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 flex h-5 w-5 items-center justify-center rounded bg-white shadow-md transition-transform duration-200 ${
                        checked ? "translate-x-5" : "translate-x-0"
                    }`}
                >
                    {checked && (
                        <svg
                            className="h-3 w-3 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3.5"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    )}
                </span>
            </span>
        </button>
    );
}

/** Dual-thumb slider over a continuous minute axis; labels show time only.
 *  Commits on release to avoid a refetch per drag tick. */
function TimeRangeSlider({
    bounds,
    fromMin,
    toMin,
    onCommit,
}: {
    bounds: { minMin: number; maxMin: number };
    fromMin: number | null;
    toMin: number | null;
    onCommit: (from: number, to: number) => void;
}) {
    const [from, setFrom] = useState(fromMin ?? bounds.minMin);
    const [to, setTo] = useState(toMin ?? bounds.maxMin);

    const pct = (m: number) =>
        ((m - bounds.minMin) / (bounds.maxMin - bounds.minMin)) * 100;

    return (
        <div className="flex w-60 flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                <span className="rounded bg-gray-100 dark:bg-white/10 px-1 py-0.5 font-mono tabular-nums">
                    {formatMinute(from)}
                </span>
                <span className="font-medium">Startzeit</span>
                <span className="rounded bg-gray-100 dark:bg-white/10 px-1 py-0.5 font-mono tabular-nums">
                    {formatMinute(to)}
                </span>
            </div>
            <div className="relative h-4">
                <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-gray-200 dark:bg-white/10" />
                <div
                    className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-ci-green-300"
                    style={{ left: `${pct(from)}%`, right: `${100 - pct(to)}%` }}
                />
                <input
                    type="range"
                    min={bounds.minMin}
                    max={bounds.maxMin}
                    step={STEP}
                    value={from}
                    onChange={(e) =>
                        setFrom(Math.min(Number(e.target.value), to - STEP))
                    }
                    onPointerUp={() => onCommit(from, to)}
                    className="range-thumb pointer-events-none absolute w-full appearance-none bg-transparent"
                />
                <input
                    type="range"
                    min={bounds.minMin}
                    max={bounds.maxMin}
                    step={STEP}
                    value={to}
                    onChange={(e) =>
                        setTo(Math.max(Number(e.target.value), from + STEP))
                    }
                    onPointerUp={() => onCommit(from, to)}
                    className="range-thumb pointer-events-none absolute w-full appearance-none bg-transparent"
                />
            </div>
        </div>
    );
}
