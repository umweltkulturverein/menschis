import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth/nextauth";
import { GetShiftsByEvent } from "@/lib/db/shifts";
import { GetShiftKindsByEvent } from "@/lib/db/shiftKinds";
import { GetEntriesByShifts } from "@/lib/db/shiftEntries";
import { GetPersonBySub } from "@/lib/db/persons";
import ShiftPanel from "./ShiftPanel";
import { NextResponse } from "next/server";
import {
    EMPTY_FILTERS,
    ShiftFilters,
    shiftInTimeWindow,
} from "@/lib/shifts/filters";

export default async function ShiftSummary({
    eventId,
    eventDayId,
    authError,
    filters = EMPTY_FILTERS,
}: {
    eventId: number;
    eventDayId?: number;
    authError: NextResponse<unknown> | null;
    filters?: ShiftFilters;
}) {
    const session = await getServerSession(authOptions);
    const [allShifts, kinds] = await Promise.all([
        GetShiftsByEvent(eventId, eventDayId, authError, filters),
        GetShiftKindsByEvent(eventId),
    ]);

    // Start-time window is applied here: it aggregates across days, so it can't
    // live in the SQL query alongside the eventDay grouping.
    const shifts = allShifts.filter((s) =>
        shiftInTimeWindow(s, filters.fromMin, filters.toMin),
    );

    if (shifts.length === 0) {
        const t = await getTranslations("Shifts");
        return (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t("noneMatchFilters")}
            </p>
        );
    }

    const shiftIds = shifts.map((s) => s.id);
    const [allEntries, currentPerson] = await Promise.all([
        GetEntriesByShifts(shiftIds),
        session?.user?.id
            ? GetPersonBySub(session.user.id)
            : Promise.resolve(undefined),
    ]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((shift) => (
                <ShiftPanel
                    key={shift.id}
                    shift={shift}
                    kind={kinds.find((k) => k.id === shift.shiftKind)}
                    initialEntries={allEntries.filter(
                        (e) => e.shift === shift.id,
                    )}
                    currentPersonId={currentPerson?.id ?? null}
                    prefill={{
                        name: currentPerson?.name ?? "",
                        email: currentPerson?.email ?? "",
                        phone: currentPerson?.phone ?? "",
                    }}
                />
            ))}
        </div>
    );
}
