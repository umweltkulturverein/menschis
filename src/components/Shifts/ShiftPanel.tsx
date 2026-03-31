import { Shift, ShiftKind } from "@/types/shift";

interface Props {
    shift: Shift;
    kind: ShiftKind | undefined;
}

export default function ShiftPanel({ shift, kind }: Props) {
    return (
        <div className="grid rounded-lg overflow-hidden shadow-md bg-white dark:bg-ci-blue-700">
            <div className=" h-50">
                <div
                    className="w-full h-20 flex items-center justify-center"
                    style={{ backgroundColor: kind?.color ?? "#6b7280" }}
                >
                    <span className="text-3xl">{kind?.icon ?? "📋"}</span>
                </div>

                <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                        <h2 className="text-base font-bold text-gray-800 dark:text-white">
                            {kind?.title ?? "Unknown kind"}
                        </h2>
                        {shift.internal && (
                            <span className="ml-2 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                                Internal
                            </span>
                        )}
                    </div>

                    {kind?.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
                            {kind.description}
                        </p>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(shift.startDatetime).toLocaleTimeString(
                            "de-DE",
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                            },
                        )}
                        {" – "}
                        {new Date(shift.endDatetime).toLocaleTimeString(
                            "de-DE",
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                            },
                        )}{" "}
                        Uhr
                    </p>
                </div>
            </div>
            <div className="align-bottom">
                <hr className="m-4" />
                <h5 className="text-center mb-4">X/{shift.slots}</h5>
            </div>
        </div>
    );
}
