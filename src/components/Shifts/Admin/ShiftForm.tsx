"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Shift, ShiftKind } from "@/types/shift";
import type { EventDay } from "@/types/eventDay";
import FormModal, { labelClass } from "@/components/Misc/FormModal";
import FormTrigger from "@/components/Misc/FormTrigger";
import SearchSelect from "@/components/Misc/SearchSelect";
import { CheckboxField, TextField } from "@/components/Misc/FormFields";
import { StringToColour } from "@/lib/misc/color";

interface Props {
    eventId: number;
    shiftKinds: ShiftKind[];
    days: EventDay[];
    eventStartDate?: Date | string | null;
    shift?: Shift;
    edit?: boolean;
}

export default function ShiftForm({
    eventId,
    shiftKinds,
    days,
    eventStartDate,
    shift,
    edit,
}: Props) {
    const router = useRouter();
    const t = useTranslations("ShiftForm");
    const tf = useTranslations("Forms");
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shiftKindId, setShiftKindId] = useState<number | null>(
        shift?.shiftKind ?? null,
    );
    const [eventDayId, setEventDayId] = useState<number | null>(
        shift?.eventDayId ?? null,
    );

    const kindOptions = shiftKinds.map((k) => ({
        id: k.id,
        label: k.title,
        color: k.color,
        icon: k.icon ?? undefined,
    }));
    const dayOptions = days.map((d) => ({
        id: d.id,
        label: d.dayTitle,
        color: StringToColour(d.dayTitle),
    }));

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        if (shiftKindId === null) {
            setError(t("shiftKindRequired"));
            return;
        }

        setSubmitting(true);
        const fd = new FormData(e.currentTarget);
        const body = {
            shiftKindId: String(shiftKindId),
            startDatetime: fd.get("startDatetime") as string,
            endDatetime: fd.get("endDatetime") as string,
            slots: fd.get("slots") as string,
            eventDayId: eventDayId === null ? "" : String(eventDayId),
            internal: fd.get("internal") === "on",
        };

        const res = await fetch(`/api/event/${eventId}/shift`, {
            method: shift ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        setSubmitting(false);
        if (!res.ok) {
            setError(t("saveFailed"));
            return;
        }

        (e.target as HTMLFormElement).reset();
        setShiftKindId(shift?.shiftKind ?? null);
        setEventDayId(shift?.eventDayId ?? null);
        setOpen(false);
        router.refresh();
    }

    const startDefault = shift?.startDatetime
        ? new Date(shift.startDatetime).toISOString().slice(0, 16)
        : eventStartDate
          ? `${new Date(eventStartDate).toISOString().slice(0, 10)}T00:00`
          : undefined;
    const endDefault = shift?.endDatetime
        ? new Date(shift.endDatetime).toISOString().slice(0, 16)
        : eventStartDate
          ? `${new Date(eventStartDate).toISOString().slice(0, 10)}T00:00`
          : undefined;

    return (
        <>
            <FormTrigger
                edit={edit}
                label={t("new")}
                disabled={shiftKinds.length === 0}
                title={
                    shiftKinds.length === 0
                        ? t("createKindFirst")
                        : undefined
                }
                onClick={() => setOpen(true)}
            />
            <FormModal
                open={open}
                onClose={() => setOpen(false)}
                title={edit ? t("editTitle") : t("newTitle")}
                submitting={submitting}
                submitLabel={edit ? tf("save") : t("create")}
                onSubmit={handleSubmit}
                error={error}
            >
                <div>
                    <label className={labelClass}>{t("shiftKind")} *</label>
                    <SearchSelect
                        options={kindOptions}
                        value={shiftKindId}
                        onChange={setShiftKindId}
                        placeholder={t("selectShiftKind")}
                        emptyText={t("noKinds")}
                    />
                </div>

                {days.length > 0 && (
                    <div>
                        <label className={labelClass}>{t("day")}</label>
                        <SearchSelect
                            options={dayOptions}
                            value={eventDayId}
                            onChange={setEventDayId}
                            placeholder={t("selectDay")}
                            emptyText={t("noDays")}
                            noneLabel={t("noDay")}
                        />
                    </div>
                )}

                <TextField
                    name="slots"
                    label={t("slots")}
                    type="number"
                    min="1"
                    required
                    defaultValue={shift?.slots ?? 2}
                />

                <div className="grid grid-cols-2 gap-4">
                    <TextField
                        name="startDatetime"
                        label={t("start")}
                        type="datetime-local"
                        required
                        defaultValue={startDefault}
                    />
                    <TextField
                        name="endDatetime"
                        label={t("end")}
                        type="datetime-local"
                        required
                        defaultValue={endDefault}
                    />
                </div>

                <CheckboxField
                    name="internal"
                    label={t("internalShift")}
                    defaultChecked={shift?.internal}
                />
            </FormModal>
        </>
    );
}
