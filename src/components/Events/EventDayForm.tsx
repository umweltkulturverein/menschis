"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { EventDay } from "@/types/eventDay";
import FormModal from "@/components/Misc/Form/FormModal";
import FormTrigger from "@/components/Misc/Form/FormTrigger";
import { TextField } from "@/components/Misc/Form/FormFields";

interface Props {
    eventId: number;
    day?: EventDay;
    edit?: boolean;
}

export default function EventDayForm({ eventId, day, edit }: Props) {
    const router = useRouter();
    const t = useTranslations("EventDayForm");
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
            dayTitle: (fd.get("dayTitle") as string).trim(),
            shopItemId: (fd.get("shopItemId") as string).trim(),
        };
        if (!body.dayTitle) {
            setSubmitting(false);
            setError(t("nameRequired"));
            return;
        }

        const url = day
            ? `/api/event/${eventId}/day/${day.id}`
            : `/api/event/${eventId}/day`;
        const res = await fetch(url, {
            method: day ? "PATCH" : "POST",
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
        if (!day) return;
        const confirmed = window.confirm(
            t("deleteConfirm", { title: day.dayTitle }),
        );
        if (!confirmed) return;
        setSubmitting(true);
        const res = await fetch(`/api/event/${eventId}/day/${day.id}`, {
            method: "DELETE",
        });
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
                label={t("new")}
                onClick={() => setOpen(true)}
            />
            <FormModal
                open={open}
                onClose={() => setOpen(false)}
                title={edit ? t("editTitle") : t("newTitle")}
                submitting={submitting}
                submitLabel={edit ? tf("save") : t("create")}
                onSubmit={handleSubmit}
                onDelete={edit && day ? handleDelete : undefined}
                error={error}
            >
                <TextField
                    name="dayTitle"
                    label={t("dayName")}
                    required
                    defaultValue={day?.dayTitle}
                    placeholder={t("dayNamePlaceholder")}
                />
                <TextField
                    name="shopItemId"
                    label={t("shopItemId")}
                    defaultValue={day?.shopItemId ?? ""}
                    placeholder={t("shopItemPlaceholder")}
                />
            </FormModal>
        </>
    );
}
