"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventDay } from "@/types/eventDay";
import FormModal from "@/components/Misc/FormModal";
import FormTrigger from "@/components/Misc/FormTrigger";
import { TextField } from "@/components/Misc/FormFields";

interface Props {
    eventId: number;
    day?: EventDay;
    edit?: boolean;
}

export default function EventDayForm({ eventId, day, edit }: Props) {
    const router = useRouter();
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
            setError("Day name is required.");
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
            setError("Failed to save day.");
            return;
        }

        (e.target as HTMLFormElement).reset();
        setOpen(false);
        router.refresh();
    }

    async function handleDelete() {
        if (!day) return;
        const confirmed = window.confirm(
            `Delete day "${day.dayTitle}"? Shifts assigned to it will lose their day.`,
        );
        if (!confirmed) return;
        setSubmitting(true);
        const res = await fetch(`/api/event/${eventId}/day/${day.id}`, {
            method: "DELETE",
        });
        setSubmitting(false);
        if (!res.ok) {
            setError("Failed to delete day.");
            return;
        }
        setOpen(false);
        router.refresh();
    }

    return (
        <>
            <FormTrigger
                edit={edit}
                label="+ New Day"
                onClick={() => setOpen(true)}
            />
            <FormModal
                open={open}
                onClose={() => setOpen(false)}
                title={edit ? "Edit Day" : "New Day"}
                submitting={submitting}
                submitLabel={edit ? "Save" : "Create Day"}
                onSubmit={handleSubmit}
                onDelete={edit && day ? handleDelete : undefined}
                error={error}
            >
                <TextField
                    name="dayTitle"
                    label="Day name"
                    required
                    defaultValue={day?.dayTitle}
                    placeholder="e.g. Friday, Day 1…"
                />
                <TextField
                    name="shopItemId"
                    label="Shop item ID (optional)"
                    defaultValue={day?.shopItemId ?? ""}
                    placeholder="Pretix item ID for this day"
                />
            </FormModal>
        </>
    );
}
