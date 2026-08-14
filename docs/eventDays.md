# Event Days

## Overview

Event Days is an optional feature that lets admins split an event into more than
one day.

An event can span multiple named days (e.g. "Friday", "Day 1", "Saturday"). Days
live in their own `eventDays` table (`dayTitle`, optional `startDate`, optional
`shopItemId`, FK `eventId`). Shifts are assigned to a day via
`shift.eventDayId` (nullable). Don't confuse this with start times on shifts.

A day's identity is its `dayTitle`, not a date — an event on "Friday" can run
3PM–2AM (Saturday). Shift times are independent of the day.

---

## Ticketshop

To connect a ticketshop, event days are required: the day is the resource
attached to the ticket ordered when a shift entry is confirmed. The ticket item
ID cannot be attached to an event - the event only carries the shop's event slug
(`event.shopEventId`).

`IssueOrder` (`src/lib/ticket/main.ts`) silently issues nothing (returns `""`)
when the shift has no `eventDayId`, the day has no `shopItemId`, or the event has
no `shopEventId`.

A ShiftKind with `allAccess` set issues a ticket for every EventDay of the event
(one position per day's item) instead of only the shift's own day. We needed this
as a special benefit to provide to people who do extremely long shifts at one day.

Orders are created on confirmation, not on sign-up: guests get theirs when they
accept in the pending pop-up, and expired unconfirmed entries have their order
cancelled by the sweeper (see [magiclinks.md](auth.md)).
