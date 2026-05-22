import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { GetShiftsByEvent } from "@/lib/db/shifts";
import { GetShiftKindsByEvent } from "@/lib/db/shiftKinds";
import { GetEntriesByShifts } from "@/lib/db/shiftEntries";
import { GetPersonBySub } from "@/lib/db/persons";
import ShiftPanel from "./ShiftPanel";
import { NextResponse } from "next/server";

export default async function ShiftSummary({
    eventId,
    eventDayId,
    authError,
}: {
    eventId: number;
    eventDayId?: number;
    authError: NextResponse<unknown> | null;
}) {
    const session = await getServerSession(authOptions);
    const [shifts, kinds] = await Promise.all([
        GetShiftsByEvent(eventId, eventDayId, authError),
        GetShiftKindsByEvent(eventId),
    ]);

    if (shifts.length === 0) {
        return (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
                No shifts yet.
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
