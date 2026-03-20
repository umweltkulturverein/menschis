import { ShiftKind } from "@/types/shift";

interface Props {
    kind: ShiftKind;
}

export default function ShiftPanel({ kind }: Props) {
    return (
        <div className="rounded-lg overflow-hidden shadow-md bg-white dark:bg-ci-blue-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 transform">
            {/* Colored header */}
            <div
                className="w-full h-20 flex items-center justify-center"
                style={{ backgroundColor: kind.color }}
            >
                <span className="text-3xl">{kind.icon ?? "📋"}</span>
            </div>

            <div className="p-4">
                <h2 className="text-base font-bold text-gray-800 dark:text-white mb-1">
                    {kind.title}
                </h2>

                {kind.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {kind.description}
                    </p>
                )}
            </div>
        </div>
    );
}
