"use client";

interface Props {
    cancelLabel: string;
    confirmLabel: string;
    submitting?: boolean;
    /** Blocks confirming while the input is incomplete; cancel stays available. */
    disabled?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

/** The cancel/confirm pair shared by the inline forms that sit inside a shift
 *  card. Labels are passed in so the component stays free of any one
 *  translation namespace. */
export default function FormActions({
    cancelLabel,
    confirmLabel,
    submitting,
    disabled,
    onCancel,
    onConfirm,
}: Props) {
    return (
        <div className="flex gap-2">
            <button
                type="button"
                onClick={onCancel}
                className="flex-1 text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-ci-blue-600 cursor-pointer"
            >
                {cancelLabel}
            </button>
            <button
                type="button"
                onClick={onConfirm}
                disabled={submitting || disabled}
                className="flex-1 text-sm px-3 py-1.5 rounded-md bg-green-500 hover:bg-green-600 text-white font-medium disabled:opacity-50 cursor-pointer"
            >
                {submitting ? "..." : confirmLabel}
            </button>
        </div>
    );
}
