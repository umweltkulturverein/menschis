import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth/nextauth";
import { GetShiftsByEvent } from "@/lib/db/shifts";
import { GetShiftKindsByEvent } from "@/lib/db/shiftKinds";
import { GetShiftEntriesByShifts } from "@/lib/db/shiftEntries";
import { GetPersonBySub } from "@/lib/db/persons";
import ShiftPanel from "./ShiftPanel";
import { NextResponse } from "next/server";
import {
    BaseDays,
    EMPTY_FILTERS,
    ShiftFilters,
    shiftInTimeWindow,
} from "@/lib/shifts/filters";

export default async function ShiftSummary({
    eventId,
    eventDayId,
    authError,
    filters = EMPTY_FILTERS,
    baseDays,
}: {
    eventId: number;
    eventDayId?: number;
    authError: NextResponse<unknown> | null;
    filters?: ShiftFilters;
    baseDays: BaseDays;
}) {
    const session = await getServerSession(authOptions);
    const [allShifts, kinds] = await Promise.all([
        GetShiftsByEvent(eventId, eventDayId, authError, filters),
        GetShiftKindsByEvent(eventId),
    ]);

    // Start-time window is applied here: it aggregates across days, so it can't
    // live in the SQL query alongside the eventDay grouping.
    const shifts = allShifts.filter((s) =>
        shiftInTimeWindow(s, filters.fromMinute, filters.toMinute, baseDays),
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
        GetShiftEntriesByShifts(shiftIds),
        session?.user?.id
            ? GetPersonBySub(session.user.id)
            : Promise.resolve(undefined),
    ]);

    const shiftAccess = session?.user?.shiftAccess ?? {};

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((shift) => {
                const kind = kinds.find((k) => k.id === shift.shiftKind);
                // Magic-link holder: their session carries the kind's current
                // token, so the authorization gate is lifted for this kind.
                const authorized =
                    !!kind?.authorizationMagicLinkToken &&
                    shiftAccess[kind.id] === kind.authorizationMagicLinkToken;
                return (
                    <ShiftPanel
                        key={shift.id}
                        shift={shift}
                        kind={kind}
                        authorized={authorized}
                        viewerInternal={!authError}
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
                );
            })}
        </div>
    );
}
