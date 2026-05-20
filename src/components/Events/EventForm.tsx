"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventItem } from "@/types/event";
import FormModal from "@/components/Misc/FormModal";
import FormTrigger from "@/components/Misc/FormTrigger";
import {
    CheckboxField,
    TextareaField,
    TextField,
} from "@/components/Misc/FormFields";

interface Props {
    event?: EventItem;
    edit?: boolean;
}

function toLocalInput(date: Date | string | undefined): string | undefined {
    if (!date) return undefined;
    return new Date(date).toISOString().slice(0, 16);
}

export default function EventForm({ event, edit }: Props) {
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
            title: fd.get("title") as string,
            description: (fd.get("description") as string) || null,
            shopEventId: (fd.get("shopEventId") as string) || null,
            startDate: fd.get("startDate") as string,
            endDate: fd.get("endDate") as string,
            startBookingDateTime: fd.get("startBookingDateTime") as string,
            public: fd.get("public") === "on",
            location: fd.get("location") as string,
        };

        const url = event ? `/api/event/${event.id}` : `/api/event`;
        const res = await fetch(url, {
            method: event ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        setSubmitting(false);
        if (!res.ok) {
            setError("Failed to save event.");
            return;
        }

        (e.target as HTMLFormElement).reset();
        setOpen(false);
        router.refresh();
    }

    async function handleDelete() {
        if (!event) return;
        const confirmed = window.confirm(
            `Delete event "${event.title}"? All days, shift kinds, shifts and entries will also be deleted.`,
        );
        if (!confirmed) return;
        setSubmitting(true);
        const res = await fetch(`/api/event/${event.id}`, { method: "DELETE" });
        setSubmitting(false);
        if (!res.ok) {
            setError("Failed to delete event.");
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
                label="+ New Event"
                onClick={() => setOpen(true)}
            />
            <FormModal
                open={open}
                onClose={() => setOpen(false)}
                title={edit ? "Edit Event" : "New Event"}
                submitting={submitting}
                submitLabel={edit ? "Save" : "Create Event"}
                onSubmit={handleSubmit}
                onDelete={edit && event ? handleDelete : undefined}
                error={error}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        name="title"
                        label="Title"
                        required
                        defaultValue={event?.title}
                    />
                    <TextField
                        name="location"
                        label="Location"
                        required
                        defaultValue={event?.location}
                    />
                </div>

                <TextField
                    name="shopEventId"
                    label="Event ID in Ticketshop (optional)"
                    defaultValue={event?.shopEventId ?? ""}
                />

                <TextareaField
                    name="description"
                    label="Description"
                    rows={3}
                    defaultValue={event?.description ?? ""}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextField
                        name="startDate"
                        label="Start"
                        type="datetime-local"
                        required
                        defaultValue={toLocalInput(event?.startDate)}
                    />
                    <TextField
                        name="endDate"
                        label="End"
                        type="datetime-local"
                        required
                        defaultValue={toLocalInput(event?.endDate)}
                    />
                    <TextField
                        name="startBookingDateTime"
                        label="Booking opens"
                        type="datetime-local"
                        required
                        defaultValue={toLocalInput(event?.startBookingDateTime)}
                    />
                </div>

                <CheckboxField
                    name="public"
                    label="List Publicly"
                    defaultChecked={event?.public}
                />
            </FormModal>
        </>
    );
}
