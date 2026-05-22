"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Shift, ShiftKind } from "@/types/shift";
import type { EventDay } from "@/types/eventDay";
import FormModal from "@/components/Misc/FormModal";
import FormTrigger from "@/components/Misc/FormTrigger";
import {
    CheckboxField,
    SelectField,
    TextField,
} from "@/components/Misc/FormFields";

interface Props {
    eventId: number;
    shiftKinds: ShiftKind[];
    days: EventDay[];
    shift?: Shift;
    edit?: boolean;
}

export default function ShiftForm({
    eventId,
    shiftKinds,
    days,
    shift,
    edit,
}: Props) {
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
            shiftKindId: fd.get("shiftKindId") as string,
            startDatetime: fd.get("startDatetime") as string,
            endDatetime: fd.get("endDatetime") as string,
            slots: fd.get("slots") as string,
            eventDayId: fd.get("eventDayId") as string,
            internal: fd.get("internal") === "on",
        };

        const res = await fetch(`/api/event/${eventId}/shift`, {
            method: shift ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        setSubmitting(false);
        if (!res.ok) {
            setError("Failed to save shift.");
            return;
        }

        (e.target as HTMLFormElement).reset();
        setOpen(false);
        router.refresh();
    }

    const startDefault = shift?.startDatetime
        ? new Date(shift.startDatetime).toISOString().slice(0, 16)
        : undefined;
    const endDefault = shift?.endDatetime
        ? new Date(shift.endDatetime).toISOString().slice(0, 16)
        : undefined;

    return (
        <>
            <FormTrigger
                edit={edit}
                label="+ New Shift"
                disabled={shiftKinds.length === 0}
                title={
                    shiftKinds.length === 0
                        ? "Create a shift kind first"
                        : undefined
                }
                onClick={() => setOpen(true)}
            />
            <FormModal
                open={open}
                onClose={() => setOpen(false)}
                title={edit ? "Edit Shift" : "New Shift"}
                submitting={submitting}
                submitLabel={edit ? "Save" : "Create Shift"}
                onSubmit={handleSubmit}
                error={error}
            >
                <SelectField
                    name="shiftKindId"
                    label="Shift Kind"
                    required
                    defaultValue={shift?.shiftKind}
                >
                    <option value="">Select a shift kind…</option>
                    {shiftKinds.map((kind) => (
                        <option key={kind.id} value={kind.id}>
                            {kind.icon ? `${kind.icon} ` : ""}
                            {kind.title}
                        </option>
                    ))}
                </SelectField>

                {days.length > 0 && (
                    <SelectField
                        name="eventDayId"
                        label="Day"
                        defaultValue={shift?.eventDayId ?? ""}
                    >
                        <option value="">—</option>
                        {days.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.dayTitle}
                            </option>
                        ))}
                    </SelectField>
                )}

                <TextField
                    name="slots"
                    label="Number of Slots"
                    type="number"
                    min="1"
                    required
                    defaultValue={shift?.slots ?? 2}
                />

                <div className="grid grid-cols-2 gap-4">
                    <TextField
                        name="startDatetime"
                        label="Start"
                        type="datetime-local"
                        required
                        defaultValue={startDefault}
                    />
                    <TextField
                        name="endDatetime"
                        label="End"
                        type="datetime-local"
                        required
                        defaultValue={endDefault}
                    />
                </div>

                <CheckboxField
                    name="internal"
                    label="Internal shift"
                    defaultChecked={shift?.internal}
                />
            </FormModal>
        </>
    );
}
