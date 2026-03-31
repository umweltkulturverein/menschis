import { GetShiftsByEvent, GetShiftKindsByEvent } from "@/lib/db/shifts";
import ShiftPanel from "./ShiftPanel";

export default async function ShiftSummary({ eventId }: { eventId: number }) {
    const [shifts, kinds] = await Promise.all([
        GetShiftsByEvent(eventId),
        GetShiftKindsByEvent(eventId),
    ]);

    if (shifts.length === 0) {
        return (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
                No shifts yet.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((shift) => (
                <ShiftPanel
                    key={shift.id}
                    shift={shift}
                    kind={kinds.find((k) => k.id === shift.shiftKind)}
                />
            ))}
        </div>
    );
}
