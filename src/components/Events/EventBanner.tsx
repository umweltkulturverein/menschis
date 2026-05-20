import {
    NaturalDateTime,
    NaturalDateTimeCompare,
    NaturalTime,
} from "@/lib/misc/contextAwareDates";
import { EventItem } from "@/types/event";
import EventForm from "@/components/Events/EventForm";

interface Props {
    event: EventItem;
    editable?: boolean;
}

export default function EventBanner({ event, editable }: Props) {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const bookingDate = new Date(event.startBookingDateTime);

    return (
        <div className="relative w-full h-50 bg-gradient-to-br from-ci-green-200 to-ci-green-300 dark:from-ci-green-600 dark:to-ci-green-500 flex items-end group">
            {editable && (
                <div className="absolute top-4 right-4 z-20">
                    <EventForm event={event} edit />
                </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <svg
                    className="w-40 h-30 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                </svg>
            </div>
            <div className="relative w-full bg-gradient-to-t from-black/60 to-transparent px-8 pt-16 pb-6">
                {event.public ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-green-300 mb-2 w-fit">
                        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                        Open to Entry
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-yellow-300 mb-2 w-fit">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                        Editor mode
                    </span>
                )}
                <h1 className="text-3xl font-bold text-white drop-shadow mb-4">
                    {event.title}
                </h1>
                <div className="flex flex-wrap gap-5 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                        <svg
                            className="w-4 h-4 text-white/60 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                        </svg>
                        <span>
                            {NaturalDateTimeCompare(startDate, endDate)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg
                            className="w-4 h-4 text-white/60 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg
                            className="w-4 h-4 text-white/60 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                            />
                        </svg>
                        <span>
                            Booking opens {NaturalDateTime(bookingDate)}
                            Uhr
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
