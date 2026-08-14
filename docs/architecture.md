# Menschis Architecture

Menschis is a Next.js app with a Postgres database accessed through
Kysely. Migrations run automatically on server start (`src/instrumentation.ts` →
`src/migrate/migrate.ts`), so deploying a new image applies pending migrations.

It is also dependent of a cron sidecar for cleanup which has to be deployed separately.

## Basic Concepts

External users are public users. They do not have an option to register an
account, only to sign up for shifts. Their identity is tied to a permanent
magic-link token that is sent by email on their first sign-up (see
[magiclinks.md](auth.md)). So even tho they do not have a real account,
if they click the link in the email they count as "signed-in".

Internal users are helpers with an account in the OIDC provider. They sign in
via SSO and can book shifts, including shifts marked `internal`.

Admin users are people who manage shifts before the event and onsite.
They can Modify everything related to an event like Shifts, Shiftkinds or Days
but also can do stuff like changing or adding shiftentries or checking users in on arrival.
Currently Admin Users are tied to a globally defined admin role in the ODIC Provider.
There is no per-Event Admin option.

Sign-up validation (`POST /api/shift/[shiftId]/entry`):

- Cloudflare Turnstile captcha for anonymous visitors (skipped entirely when
  `TURNSTILE_SECRET_KEY` is unset, and skipped for any signed-in session).
- A guest sign-up is stored with `verified = false`. The UI shows a warning that
  the email has to be confirmed. Signed-In Users create shift entries directly.
- Confirmation happens by following the magic link and accepting in the pending
  pop-up (`POST /api/auth/pending`); only then is the ticket order issued and
  the confirmation mail sent.
- Unconfirmed entries expire after `VERIFY_WINDOW_MS` (2h,
  `src/lib/db/shiftEntries.ts`) and are removed by the cron sweeper
  `GET /api/cron/expire-entries`, which cancels the Pretix order first.
- Sign-ups by a signed-in user whose session email matches the form email are
  verified immediately and skip the pending state.

## Data Structure

Column names below are the Kysely/TypeScript names (`src/types/`); Postgres
stores them snake_cased.

Times are handled by running the process in the venue's timezone: set `TZ`
(e.g. `TZ=Europe/Berlin`). `shift.startDatetime`/`endDatetime` and the event
date columns are `timestamp` without zone, so what was entered is what is
stored and what is rendered. `shiftEntry.createdAt`/`updatedAt`/`checkedInAt`
are `timestamptz` instants. Formatting goes through
`src/lib/misc/contextAwareDates.ts`.

- Event (`event`)
  - **id**: Serial
  - **title**: String
  - description: String | null
  - infoText: String | null // appended to the shift confirmation email
  - startDate / endDate: DateTime (wall clock)
  - startBookingDateTime: DateTime (wall clock) — stored and editable, but not
    yet enforced anywhere in code
  - location: String
  - public: Boolean — stored, currently not filtered on (the `where` clauses in
    `src/lib/db/events.ts` are commented out)
  - shopEventId: String? // Pretix event slug
  - backstageAccess: Boolean, tokenCount: Integer — stored only, unused so far
- EventDay (`eventDays`) — see [eventDays.md](eventDays.md)
- Shift (`shift`)
  - **id**: Serial
  - shiftKind: FK → shiftKind
  - eventDayId: FK → eventDays (nullable)
  - startDatetime / endDatetime: DateTime (wall clock)
  - internal: Boolean
  - slots: Integer // capacity; sign-up is rejected once entries reach it
- ShiftKind (`shiftKind`)
  - **id**: Serial
  - eventId: FK → event
  - title: String
  - description: String | null
  - authorizationMessage: String | null // set = the kind is locked; the text is
    shown to unauthorized viewers, e.g. "Contact Awareness Team"
  - authorizationMagicLinkToken: String | null // planners share a link that
    grants access to this kind, see "Shift access" below
  - icon: String | null
  - color: String
  - allAccess: Boolean // issues a ticket for every EventDay instead of only the
    shift's day
- ShiftEntry (`shiftEntry`)
  - **id**: Serial
  - **shift**: FK → shift
  - **person**: FK → person
  - name: String // the name typed in the form, independent of person.name
  - notes: String
  - verified: Boolean // false = pending email confirmation
  - order: String | null // Pretix order code
  - checkedInAt: DateTime | null // set by an admin on site
  - adminNote: String | null // admin-only free text
  - createdAt / updatedAt: DateTime
- Person (`person`)
  - **id**: Serial
  - sub: String // OIDC sub for SSO users, `email:<address>` for guests
  - name, email: String
  - phone: String | null
  - loginToken: String | null // magic-link token; see magiclinks.md
  - roles: String[] | null // claims copied from the OIDC roles claim

There is no location/GeoPoint on shifts or shift kinds.

## Access Control

Authorization is derived from the session, not from a role table
(`src/lib/auth/permissions.ts`):

- `isInternalUser(session)` — any SSO user, i.e. a session whose `sub` does not
  start with `email:`. Internal users see and book `internal` shifts.
- `isAdminUser(session)` — the session's roles contain `OIDC_ADMIN_GROUP`
  (default `admin`). Admins create and manage events, shifts, kinds and days,
  and see the dashboard with full entry details.
- `requireInternalUser` / `requireAdminUser` return a 401/403 `NextResponse` or
  `null`. `requireAdminUser` guards every mutating admin route under
  `/api/event/**` and `/api/shift/[shiftId]/entry/[entryId]/admin`.

There is no separate `Planner` role and no impersonation mode — planners are
admins today.

### Shift access (kind-level magic links)
Our Awareness Team wanted Shifts that can only be booked if the person has a
special link for them. If users do not have the link, a message is shown when
they hover or click in the area.
A locked shift kind (`authorizationMessage` set) can only be booked with the
matching token. `GET /api/auth/authorized_shifts?shiftaccess=<kindId>:<token>`
validates the token against `shiftKind.authorizationMagicLinkToken` and stores
the grant in its own signed cookie (`shift-access`, `__Secure-` prefixed over
HTTPS, 90 days) — independent of the login session
(`src/lib/auth/shiftAccess.ts`). The entry route re-checks the cookie before
accepting a sign-up.

## Pages

- `/` landing, `/events` list, `/legal/privacy`
- `/events/[event]` — shift board (`EventShiftBoard`), filters, sign-up forms
- `/events/[event]/dashboard` — admin-only, the same board with every entry in
  full (contact data, notes, check-in, admin note)
- `/events/[event]/edit` — admin-only; event data, days, shift kinds, shifts and
  the internal SSO link. Non-admins are redirected to the overview.

## Other

- i18n via next-intl; locales in `src/i18n/config.ts` (`de` default, `en`),
  strings in `messages/*.json`.
- Ticketing via Pretix is optional (`src/lib/ticket/`): orders are only created
  when the event has a `shopEventId` and the shift's day has a `shopItemId`.
- Email via nodemailer (`src/lib/email/`); skipped with a warning when SMTP is
  not configured.
