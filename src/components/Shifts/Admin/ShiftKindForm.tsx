"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ShiftKind } from "@/types/shift";
import FormModal from "@/components/Misc/Form/FormModal";
import FormTrigger from "@/components/Misc/Form/FormTrigger";
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
                <CheckboxField
                    name="allAccess"
                    label={t("allAccess")}
                    defaultChecked={kind?.allAccess}
                />
            </FormModal>
        </>
    );
}
