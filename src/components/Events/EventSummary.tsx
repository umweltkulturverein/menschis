import EventPanel from "./EventPanel";

// Renders a Small Panel of an Event
export default function EventSummary() {
    return (
        <div className="event-panel">
            <EventPanel
                event={{
                    Title: "Test Event",
                    Description: "This is an Event",
                    StartDate: new Date("2024-06-01"),
                    EndDate: new Date("2024-06-01"),
                    Location: "Home",
                }}
            />
        </div>
    );
}
