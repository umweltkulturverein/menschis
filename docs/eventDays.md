# Event Days

## Overview

Event Days is an Optional Feature to allow Planners to Split an Event into more than one Day.

An event can span multiple named days (e.g. "Friday", "Day 1", "Saturday"). Days are stored as a `text[]` JSON column on the `event` table. Shifts are assigned to a day via `shift.eventDay`.
Don't confuse with starting Times on Shifts.

The Reason why Dates do not Relate to them is that an Event on "Friday" can go from 3PM to 2AM (Saturday) If the Day's weren't Strings this Flexibility in designing a shift overview wouldn't exist.


---

## Event Page Display

If `event.days` is set and non-empty, the event page renders one section per day, each with its own `<ShiftSummary>` filtered to that day.

If `event.days` is empty or null, a single unfiltered `<ShiftSummary>` is shown.


```tsx
{event.days && event.days.length > 0 ? (
    event.days.map((day) => (
        <div key={day}>
            <h1>{day}</h1>
            <ShiftSummary eventId={event.id} eventDay={day} />
        </div>
    ))
) : (
    <ShiftSummary eventId={event.id} />
)}
```

---

## Filtering Shifts by Day

`GetShiftsByEvent(eventId, eventDay?)` in `src/lib/db/shifts.ts` accepts an optional `eventDay`. When provided it adds a `.where("shift.eventDay", "=", eventDay)` clause. When omitted, no day filter is applied and all shifts for the event are returned.

---

## Managing Days (Edit Page)

The `EventDaysEditor` component (`src/components/Events/EventDaysEditor.tsx`) lets admins add and remove days.

- **Add:** text input → appended and sorted → saved via `PATCH /api/event/[id]/edit`.
- **Remove:** clicking `×` on a day chip shows a confirmation dialog:
  > "Are you sure you want to delete '[day]'?"


## Ticketshop
For Connecting with a Ticketshop, Eventdays are required as they are the Resource attached to the Ticket that is ordered when a shiftentry is made. The Ticket Item ID cannot be attached to an Event.