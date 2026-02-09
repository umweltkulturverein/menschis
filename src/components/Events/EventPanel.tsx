import { Event } from "@/types/event";

interface Props {
  event: Event;
  onClick?: () => void;
}

// Renders a Small Panel of an Event
export default function EventPanel({ event, onClick }: Props) {
  return (
    <div
      className={`rounded-lg p-4 shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${"bg-white dark:bg-gray-800"}`}
      onClick={onClick}
    >
      {/* Event Image Placeholder */}
      <div className="w-full h-32 mb-3 rounded-md overflow-hidden bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-ci-blue-400 dark:to-ci-blue-500 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-ci-blue-500 dark:text-ci-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
          ></path>
        </svg>
      </div>

      <h1 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
        {event.Title}
      </h1>

      {event.Description && (
        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm line-clamp-3">
          {event.Description}
        </p>
      )}

      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
        <div>
          <span className="font-small text-ci-green-400 dark:text-ci-green-300">
            Start:{" "}
          </span>
          <span className="font-normal">
            {event.StartDate.toLocaleDateString("de-DE")}{" "}
            {event.StartDate.toLocaleTimeString("de-DE", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div>
          <span className="font-small text-ci-green-400 dark:text-ci-green-300">
            End:{" "}
          </span>
          <span className="font-normal">
            {event.EndDate.toLocaleDateString("de-DE")}{" "}
            {event.EndDate.toLocaleTimeString("de-DE", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
        <svg
          className="w-4 h-4 mr-1 text-green-500 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          ></path>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
        </svg>
        <span className="font-medium text-gray-700 dark:text-gray-200">
          {event.Location}
        </span>
      </div>
    </div>
  );
}
