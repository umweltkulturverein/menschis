# Magic Links & Authentication

## Overview

The app is built around guests who never log in deliberately. Authentication
happens in two ways:

- **Internal users (SSO):** Sign in via the OIDC provider. There is no sign-in
  button in the navbar; the footer carries a discreet "Team Login" link to
  `/api/auth/signin`, and a shareable SSO link with a `callbackUrl` redirect is
  shown on the event edit page under "Internal Shift Entry Link".
- **Guest users (email):** Authenticated via a permanent magic link sent to
  their email after signing up for a shift.

A third, separate mechanism grants access to a locked shift *kind* without any
login at all — see "Shift access links" below.

---

## Guest Sign-up Flow

1. Guest fills in the shift entry form (name, email required, phone optional,
   notes optional) and solves the Turnstile captcha.
2. `POST /api/shift/[shiftId]/entry`
3. The route runs the sign-up gates in order: free slots → name+email present →
   captcha (anonymous visitors only) → shift-access token for locked kinds →
   `internal` shifts restricted to internal users.
4. `FindOrCreatePersonByEmail` finds an existing person by email or creates one
   with `sub = "email:<address>"` and a generated `loginToken` UUID.
5. The entry is created with `verified = false` — **no ticket order is issued
   yet** and no confirmation mail is sent.
6. A magic link email is sent via `sendMagicLink` in `src/lib/email/email.ts`.
   The link includes a `redirect` query param derived from the `Referer` header
   so the user lands back on the event page after signing in.
7. The UI tells the user to confirm via pressing verify to keep the entry.

A shift entry made by a signed-in user whose session email equals the form email
skips this: the entry is stored `verified = true`, the Pretix order is issued
immediately and the confirmation mail goes out right away.

### Confirming and expiry

- After following the magic link, `PendingShiftsPopup` fetches
  `GET /api/auth/pending` (the person's `verified = false` entries).
- Accepting posts to `POST /api/auth/pending`, which flips the entries to
  verified, issues the ticket order per entry and sends the shift entry email.
- Entries that stay pending longer than `VERIFY_WINDOW_MS` (2h,
  `src/lib/db/shiftEntries.ts`) are swept by
  `GET /api/cron/expire-entries`. The sweeper cancels the Pretix order first and
  only deletes the row on success, so a failed cancel is retried next run. It is
  called by a cron sidecar and authenticates with
  `Authorization: Bearer $CRON_SECRET`. see [[architecture.md]](architecture.md)

---

## Magic Link URL

```
/api/auth/magic?token=<loginToken>&redirect=/events/<eventId>
```

## Distinguishing Guest vs Internal Users

Guest/external persons have `sub` prefixed with `"email:"`. SSO persons have a bare OIDC
sub.

```ts
// src/lib/auth/permissions.ts
(session?.user?.id)           // true for any user with session
isInternalUser(session)       // true for SSO (internal) users only
isAdminUser(session)          // true for users whose roles contain OIDC_ADMIN_GROUP
requireInternalUser/requireAdminUser(session)  // returns 401/403 NextResponse or null
```

`requireAdminUser` guards every admin/edit API route:

- `POST /api/event`, `PATCH`/`DELETE /api/event/[id]`
- `POST /api/event/[id]/shiftkind`, `PATCH`/`DELETE .../shiftkind/[kindId]`
- `POST`/`PATCH`/`DELETE /api/event/[id]/shift`
- `POST /api/event/[id]/day`, `PATCH`/`DELETE .../day/[dayId]`
- `PATCH /api/shift/[shiftId]/entry/[entryId]/admin` (check-in, admin note,
  verified)

The edit page and the dashboard redirect non-admins to the event overview
instead of showing an error.

---


## Internal Shift Entry Link (Edit Page)

Shown on the event edit page. It is the SSO sign-in URL with `callbackUrl`
pointing to the event overview:

```
/api/auth/signin/oidc?callbackUrl=%2Fevents%2F<eventId>?internal=1
```

The link is used for internal people to register for shifts. The main login
button is hidden to reduce confusion for guest users, who are the intended
majority of users.