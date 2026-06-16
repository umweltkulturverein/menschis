"use client";

import { useEffect, useRef, useState } from "react";

export interface SearchSelectOption {
    id: number;
    label: string;
    /** Optional hex colour; renders a dot before the label when present. */
    color?: string;
    /** Optional emoji/icon shown before the label. */
    icon?: string;
}

interface BaseProps {
    options: SearchSelectOption[];
    placeholder: string;
    emptyText: string;
    /** Width/layout class applied to the field wrapper. */
    className?: string;
}

interface MultiProps extends BaseProps {
    multiple: true;
    selected: number[];
    onToggle: (id: number) => void;
    removeLabel: (label: string) => string;
}

interface SingleProps extends BaseProps {
    multiple?: false;
    value: number | null;
    onChange: (id: number | null) => void;
    /** Renders a hidden input under this name so the value is form-submittable. */
    name?: string;
    /** When set, shows a clearable "none" entry (for optional selects). */
    noneLabel?: string;
}

type Props = MultiProps | SingleProps;

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

function Dot({ color }: { color: string }) {
    return (
        <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: color }}
        />
    );
}

const fieldClass =
    "flex min-h-9 w-full items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-ci-blue-800/60 px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-ci-green-300/60 focus-within:border-ci-green-300 transition-shadow cursor-pointer";

const listClass =
    "absolute z-30 mt-1.5 w-full max-h-64 overflow-auto rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-ci-blue-700 shadow-xl shadow-black/10 py-1";

/**
 * Searchable select with optional colour dots and icons. Shared by the shift
 * filter bar (`multiple`) and the shift form (single select). Visual styling is
 * kept identical across both so the controls feel native everywhere.
 */
export default function SearchSelect(props: Props) {
    const { options, placeholder, emptyText, className } = props;
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    useOutsideClose(ref, () => setOpen(false));

    const visible = options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase()),
    );

    function OptionRow({
        o,
        active,
        onClick,
    }: {
        o: SearchSelectOption;
        active: boolean;
        onClick: () => void;
    }) {
        return (
            <button
                type="button"
                onClick={onClick}
                title={o.label}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-left text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5"
            >
                {o.color && (
                    <span
                        className="h-2.5 w-2.5 rounded-full shrink-0 ring-2 ring-white dark:ring-ci-blue-700"
                        style={{ backgroundColor: o.color }}
                    />
                )}
                <span className="flex-1 truncate">
                    {o.icon ? `${o.icon} ` : ""}
                    {o.label}
                </span>
                {active && (
                    <span className="text-ci-green-300 font-semibold">✓</span>
                )}
            </button>
        );
    }

    if (props.multiple) {
        const { selected, onToggle, removeLabel } = props;
        const selectedOptions = options.filter((o) => selected.includes(o.id));

        return (
            <div ref={ref} className={`relative ${className ?? "w-64 shrink-0"}`}>
                <div onClick={() => setOpen(true)} className={`${fieldClass} flex-wrap`}>
                    {selectedOptions.map((o) => (
                        <span
                            key={o.id}
                            title={o.label}
                            className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 dark:bg-white/10 pl-1.5 pr-1 py-0.5 text-xs text-gray-700 dark:text-gray-100"
                        >
                            {o.color && <Dot color={o.color} />}
                            {o.icon ? `${o.icon} ` : ""}
                            {o.label}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggle(o.id);
                                }}
                                className="text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer leading-none"
                                aria-label={removeLabel(o.label)}
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
                    <ul className={listClass}>
                        {visible.length === 0 && (
                            <li className="px-3 py-2 text-sm text-gray-400">
                                {emptyText}
                            </li>
                        )}
                        {visible.map((o) => (
                            <li key={o.id}>
                                <OptionRow
                                    o={o}
                                    active={selected.includes(o.id)}
                                    onClick={() => onToggle(o.id)}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

    const { value, onChange, name, noneLabel } = props;
    const selectedOption = options.find((o) => o.id === value) ?? null;

    return (
        <div ref={ref} className={`relative ${className ?? "w-full"}`}>
            {name && <input type="hidden" name={name} value={value ?? ""} />}
            <div onClick={() => setOpen((o) => !o)} className={fieldClass}>
                {selectedOption ? (
                    <span
                        title={selectedOption.label}
                        className="flex flex-1 items-center gap-1.5 text-sm text-gray-800 dark:text-white truncate"
                    >
                        {selectedOption.color && (
                            <Dot color={selectedOption.color} />
                        )}
                        {selectedOption.icon ? `${selectedOption.icon} ` : ""}
                        {selectedOption.label}
                    </span>
                ) : (
                    <span className="flex-1 text-sm text-gray-400">
                        {placeholder}
                    </span>
                )}
                <svg
                    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                        open ? "rotate-180" : ""
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
            </div>

            {open && (
                <ul className={listClass}>
                    <li className="px-2 pb-1.5">
                        <input
                            autoFocus
                            type="text"
                            value={query}
                            placeholder={placeholder}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-ci-blue-800/60 px-2 py-1 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ci-green-300/60"
                        />
                    </li>
                    {noneLabel && (
                        <li>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(null);
                                    setOpen(false);
                                    setQuery("");
                                }}
                                className="flex w-full items-center px-3 py-2 text-sm text-left text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                                {noneLabel}
                            </button>
                        </li>
                    )}
                    {visible.length === 0 && (
                        <li className="px-3 py-2 text-sm text-gray-400">
                            {emptyText}
                        </li>
                    )}
                    {visible.map((o) => (
                        <li key={o.id}>
                            <OptionRow
                                o={o}
                                active={o.id === value}
                                onClick={() => {
                                    onChange(o.id);
                                    setOpen(false);
                                    setQuery("");
                                }}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
