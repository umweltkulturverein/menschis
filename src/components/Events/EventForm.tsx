"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { EventItem } from "@/types/event";
import FormModal from "@/components/Misc/Form/FormModal";
import FormTrigger from "@/components/Misc/Form/FormTrigger";
import {
    CheckboxField,
    TextareaField,
    TextField,
} from "@/components/Misc/Form/FormFields";

interface Props {
    event?: EventItem;
    edit?: boolean;
    duplicate?: boolean;
}

function toLocalInput(date: Date | string | undefined): string | undefined {
    if (!date) return undefined;
    return new Date(date).toISOString().slice(0, 16);
}

export default function EventForm({ event, edit, duplicate }: Props) {
    const router = useRouter();
    const t = useTranslations("EventForm");
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
            infoText: (fd.get("infoText") as string) || null,
            shopEventId: (fd.get("shopEventId") as string) || null,
            startDate: fd.get("startDate") as string,
            endDate: fd.get("endDate") as string,
            startBookingDateTime: fd.get("startBookingDateTime") as string,
            public: fd.get("public") === "on",
            location: fd.get("location") as string,
        };

        const url = edit && event ? `/api/event/${event.id}` : `/api/event`;
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
        if (!event) return;
        const confirmed = window.confirm(
            t("deleteConfirm", { title: event.title }),
        );
        if (!confirmed) return;
        setSubmitting(true);
        const res = await fetch(`/api/event/${event.id}`, { method: "DELETE" });
        setSubmitting(false);
        if (!res.ok) {
            setError(t("deleteFailed"));
            return;
        }
        setOpen(false);
        router.push("/events");
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
                onDelete={edit && event ? handleDelete : undefined}
                error={error}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        name="title"
                        label={t("title")}
                        required
                        defaultValue={event?.title}
                    />
                    <TextField
                        name="location"
                        label={t("location")}
                        required
                        defaultValue={event?.location}
                    />
                </div>

                <TextField
                    name="shopEventId"
                    label={t("shopEventId")}
                    defaultValue={duplicate ? "" : event?.shopEventId ?? ""}
                />

                <TextareaField
                    name="description"
                    label={t("description")}
                    rows={3}
                    defaultValue={event?.description ?? ""}
                />

                <TextareaField
                    name="infoText"
                    label={t("infoText")}
                    rows={4}
                    defaultValue={event?.infoText ?? ""}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextField
                        name="startDate"
                        label={t("start")}
                        type="datetime-local"
                        required
                        defaultValue={toLocalInput(event?.startDate)}
                    />
                    <TextField
                        name="endDate"
                        label={t("end")}
                        type="datetime-local"
                        required
                        defaultValue={toLocalInput(event?.endDate)}
                    />
                    <TextField
                        name="startBookingDateTime"
                        label={t("bookingOpens")}
                        type="datetime-local"
                        required
                        defaultValue={toLocalInput(event?.startBookingDateTime)}
                    />
                </div>

                <CheckboxField
                    name="public"
                    label={t("listPublicly")}
                    defaultChecked={event?.public}
                />
            </FormModal>
        </>
    );
}
