"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ShiftKind } from "@/types/shift";
import FormModal, { labelClass } from "@/components/Misc/Form/FormModal";
import FormTrigger from "@/components/Misc/Form/FormTrigger";
import CheckIcon from "@/components/icons/CheckIcon";
import CopyIcon from "@/components/icons/CopyIcon";
import RotateIcon from "@/components/icons/RotateIcon";
import { FILTER_KEYS } from "@/lib/shifts/filters";
import {
    CheckboxField,
    ColorField,
    TextareaField,
    TextField,
} from "@/components/Misc/Form/FormFields";


interface Props {
    eventId: number;
    kind?: ShiftKind;
    edit?: boolean;
    duplicate?: boolean;
}

export default function ShiftKindForm({ eventId, kind, edit, duplicate }: Props) {
    const router = useRouter();
    const t = useTranslations("ShiftKindForm");
    const tf = useTranslations("Forms");
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(
        kind?.authorizationMagicLinkToken ?? null,
    );
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        if (!magicLink) return;
        await navigator.clipboard.writeText(magicLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const magicLink =
        edit && kind && token && typeof window !== "undefined"
            ? `${window.location.origin}/api/auth/authorized_shifts?shiftaccess=${kind.id}:${token}&redirect=${encodeURIComponent(
                  `/events/${eventId}?${FILTER_KEYS.restricted}=1`,
              )}`
            : null;

    async function handleRotate() {
        if (!kind) return;
        const confirmed = window.confirm(t("rotateConfirm"));
        if (!confirmed) return;
        setSubmitting(true);
        const res = await fetch(
            `/api/event/${eventId}/shiftkind/${kind.id}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rotateMagicLinkToken: true }),
            },
        );
        setSubmitting(false);
        if (!res.ok) {
            setError(t("rotateFailed"));
            return;
        }
        const updated = (await res.json()) as ShiftKind;
        setToken(updated.authorizationMagicLinkToken);
        router.refresh();
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const fd = new FormData(e.currentTarget);
        const body = {
            title: fd.get("title") as string,
            description: (fd.get("description") as string) || null,
            icon: (fd.get("icon") as string) || null,
            color: fd.get("color") as string,
            authorizationMessage:
                (fd.get("authorizationMessage") as string) || null,
            allAccess: fd.get("allAccess") === "on",
        };

        const url = edit && kind
            ? `/api/event/${eventId}/shiftkind/${kind.id}`
            : `/api/event/${eventId}/shiftkind`;
        const res = await fetch(url, {
            method: edit ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        setSubmitting(false);
        if (!res.ok) {
            setError(t("saveFailed"));
            return;
        }

        // Token may have been generated/cleared server-side from the message
        // change — keep the displayed link in sync.
        const saved = (await res.json()) as ShiftKind;
        setToken(saved.authorizationMagicLinkToken ?? null);

        (e.target as HTMLFormElement).reset();
        setOpen(false);
        router.refresh();
    }

    async function handleDelete() {
        if (!kind) return;
        const confirmed = window.confirm(
            t("deleteConfirm", { title: kind.title }),
        );
        if (!confirmed) return;
        setSubmitting(true);
        const res = await fetch(
            `/api/event/${eventId}/shiftkind/${kind.id}`,
            { method: "DELETE" },
        );
        setSubmitting(false);
        if (!res.ok) {
            setError(t("deleteFailed"));
            return;
        }
        setOpen(false);
        router.refresh();
    }

    return (
        <>
            <FormTrigger
                edit={edit}
                duplicate={duplicate}
                label={t("new")}
                onClick={() => setOpen(true)}
            />
            <FormModal
                open={open}
                onClose={() => setOpen(false)}
                title={
                    edit
                        ? t("editTitle")
                        : duplicate
                          ? t("duplicateTitle")
                          : t("newTitle")
                }
                submitting={submitting}
                submitLabel={edit ? tf("save") : t("create")}
                onSubmit={handleSubmit}
                onDelete={edit && kind ? handleDelete : undefined}
                error={error}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        name="title"
                        label={t("title")}
                        required
                        defaultValue={kind?.title}
                    />
                    <TextField
                        name="icon"
                        label={t("icon")}
                        defaultValue={kind?.icon ?? ""}
                        placeholder="📋"
                    />
                </div>

                <TextareaField
                    name="description"
                    label={t("description")}
                    defaultValue={kind?.description ?? ""}
                />

                <ColorField
                    name="color"
                    label={t("color")}
                    required
                    defaultValue={kind?.color ?? "#3b82f6"}
                />

                <TextareaField
                    name="authorizationMessage"
                    label={t("authMessage")}
                    defaultValue={kind?.authorizationMessage ?? ""}
                />
                {magicLink && (
                    <div>
                        <label className={labelClass}>{t("magicLink")}</label>
                        <div className="relative">
                            <input
                                type="text"
                                readOnly
                                value={magicLink}
                                onFocus={(e) => e.currentTarget.select()}
                                title={magicLink}
                                className="w-full cursor-default rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-ci-blue-800/60 py-2 pl-3 pr-16 text-xs font-mono text-gray-500 dark:text-gray-400 focus:outline-none"
                            />
                            <div className="absolute inset-y-0 right-1.5 flex items-center gap-0.5">
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    title={tf("copy")}
                                    aria-label={tf("copy")}
                                    className="flex h-6 w-6 items-center justify-center rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    {copied ? (
                                        <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                        <CopyIcon className="h-3.5 w-3.5" />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRotate}
                                    disabled={submitting}
                                    title={t("rotate")}
                                    aria-label={t("rotate")}
                                    className="flex h-6 w-6 items-center justify-center rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200/70 dark:hover:bg-white/10 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                    <RotateIcon className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            {t("magicLinkHint")}
                        </p>
                    </div>
                )}
                <CheckboxField
                    name="allAccess"
                    label={t("allAccess")}
                    defaultChecked={kind?.allAccess}
                />
            </FormModal>
        </>
    );
}
