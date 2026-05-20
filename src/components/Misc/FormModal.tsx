"use client";

import React from "react";

export const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-ci-blue-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-ci-green-500";
export const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

interface Props {
    open: boolean;
    onClose: () => void;
    title: string;
    submitting: boolean;
    submitLabel: string;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onDelete?: () => void;
    error?: string | null;
    children: React.ReactNode;
}

export default function FormModal({
    open,
    onClose,
    title,
    submitting,
    submitLabel,
    onSubmit,
    onDelete,
    error,
    children,
}: Props) {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg mx-4 p-6 bg-white dark:bg-ci-blue-700 rounded-lg shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        type="button"
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    {children}

                    {error && (
                        <p className="text-red-500 text-sm" role="alert">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3 justify-end items-center">
                        {onDelete && (
                            <button
                                type="button"
                                onClick={onDelete}
                                disabled={submitting}
                                className="mr-auto px-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-ci-green-500 hover:bg-ci-green-600 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors cursor-pointer"
                        >
                            {submitting ? "Saving…" : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
