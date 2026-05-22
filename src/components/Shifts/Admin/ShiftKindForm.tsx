"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ShiftKind } from "@/types/shift";
import FormModal from "@/components/Misc/FormModal";
import FormTrigger from "@/components/Misc/FormTrigger";
import {
    ColorField,
    TextareaField,
    TextField,
} from "@/components/Misc/FormFields";

interface Props {
    eventId: number;
    kind?: ShiftKind;
    edit?: boolean;
}

export default function ShiftKindForm({ eventId, kind, edit }: Props) {
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
            icon: (fd.get("icon") as string) || null,
            color: fd.get("color") as string,
            authorizationMessage:
                (fd.get("authorizationMessage") as string) || null,
        };

        const url = kind
            ? `/api/event/${eventId}/shiftkind/${kind.id}`
            : `/api/event/${eventId}/shiftkind`;
        const res = await fetch(url, {
            method: kind ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        setSubmitting(false);
        if (!res.ok) {
            setError("Failed to save shift kind.");
            return;
        }

        (e.target as HTMLFormElement).reset();
        setOpen(false);
        router.refresh();
    }

    async function handleDelete() {
        if (!kind) return;
        const confirmed = window.confirm(
            `Delete shift kind "${kind.title}"? All shifts of this kind and their entries will also be deleted.`,
        );
        if (!confirmed) return;
        setSubmitting(true);
        const res = await fetch(
            `/api/event/${eventId}/shiftkind/${kind.id}`,
            { method: "DELETE" },
        );
        setSubmitting(false);
        if (!res.ok) {
            setError("Failed to delete shift kind.");
            return;
        }
        setOpen(false);
        router.refresh();
    }

    return (
        <>
            <FormTrigger
                edit={edit}
                label="+ New Shift Kind"
                onClick={() => setOpen(true)}
            />
            <FormModal
                open={open}
                onClose={() => setOpen(false)}
                title={edit ? "Edit Shift Kind" : "New Shift Kind"}
                submitting={submitting}
                submitLabel={edit ? "Save" : "Create Shift Kind"}
                onSubmit={handleSubmit}
                onDelete={edit && kind ? handleDelete : undefined}
                error={error}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        name="title"
                        label="Title"
                        required
                        defaultValue={kind?.title}
                    />
                    <TextField
                        name="icon"
                        label="Icon (emoji)"
                        defaultValue={kind?.icon ?? ""}
                        placeholder="📋"
                    />
                </div>

                <TextareaField
                    name="description"
                    label="Description"
                    defaultValue={kind?.description ?? ""}
                />

                <ColorField
                    name="color"
                    label="Color"
                    required
                    defaultValue={kind?.color ?? "#3b82f6"}
                />

                <TextField
                    name="authorizationMessage"
                    label="Authorization message"
                    defaultValue={kind?.authorizationMessage ?? ""}
                />
            </FormModal>
        </>
    );
}
