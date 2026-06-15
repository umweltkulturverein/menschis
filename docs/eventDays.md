# Event Days

## Overview

Event Days is an Optional Feature to allow Planners to Split an Event into more than one Day.

An event can span multiple named days (e.g. "Friday", "Day 1", "Saturday"). Days live in their own `eventDays` table (`dayTitle`, optional `startDate`, optional `shopItemId`, FK `eventId`). Shifts are assigned to a day via `shift.eventDayId`.
Don't confuse with starting Times on Shifts.

A day's identity is its `dayTitle`, not a date — an Event on "Friday" can run 3PM–2AM (Saturday). Shift times are independent of the day.


---

## Event Page Display

If the event has days, the event page renders one `<ShiftSummary eventDayId={day.id}>` per day; otherwise a single unfiltered `<ShiftSummary>`.

---

## Managing Days (Edit Page)

`EventDayForm` (`src/components/Events/EventDayForm.tsx`) lets admins create, edit and delete days via `POST /api/event/[id]/day` and `PATCH`/`DELETE /api/event/[id]/day/[dayId]`.


## Ticketshop
For Connecting with a Ticketshop, Eventdays are required as they are the Resource attached to the Ticket that is ordered when a shiftentry is made. The Ticket Item ID cannot be attached to an Event.

A ShiftKind with `allAccess` set issues a ticket for every EventDay of the event (one position per day's item) instead of only the shift's own day.