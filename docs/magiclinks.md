# Magic Links & Authentication

## Overview

There is no public login button. Authentication happens in two ways:

- **Internal users (SSO):** Sign in via the OIDC provider. A shareable SSO link with a `callbackUrl` redirect is shown on the event edit page under "Internal Shift Entry Link".
- **Guest users (email):** Authenticated via a permanent magic link sent to their email after signing up for a shift.

---

## Guest Sign-up Flow

1. Guest fills in the shift entry form (name, email required, phone optional, notes optional).
2. `POST /api/shift/[shiftId]/entry`
3. Server calls `FindOrCreatePersonByEmail`: finds an existing person by email or creates one with `sub = "email:<address>"` and a generated `loginToken` UUID.
4. A magic link email is sent via `sendMagicLink` in `src/lib/email.ts`.
5. The link includes a `redirect` query param derived from the `Referer` header so the user lands back on the event page after signing in.
6. After submitting, user is informed about the email

---

## Magic Link URL

```
/api/auth/magic?token=<loginToken>&redirect=/events/<eventId>
```

### Route: `src/app/api/auth/magic/route.ts`

1. Reads `token` from query params.
2. Looks up person by `loginToken` in the DB (`GetPersonByLoginToken`).
3. Mints a NextAuth JWT using `encode` from `next-auth/jwt`.
4. Sets it as the `next-auth.session-token` cookie (or `__Secure-` prefixed in production).
5. Redirects to the `redirect` param if it starts with `/`, otherwise `/`.

The `loginToken` is a random UUID stored in `person.loginToken`. It never expires. currently revoking means deleting the person or regenerating the token. This descicion was made to ensure nice UX as we do not want to spam the user with Auth Emails just for this Portal.

---

## Person & loginToken

- SSO users get a `loginToken` generated on every sign-in via the `signIn` callback in `src/lib/auth.ts`. Uses `COALESCE` so existing users get one on next login without overwriting an already-set token.
- Guest users get one generated in `FindOrCreatePersonByEmail` in `src/lib/db/persons.ts`.
- `EnsureLoginToken(personId)` backfills any user who was created before the migration.

---

## Distinguishing Guest vs Internal Users

Guest persons have `sub` prefixed with `"email:"`. SSO persons have a bare OIDC sub.

```ts
// src/lib/permissions.ts
isInternalUser(session)       // true for SSO users only
requireInternalUser(session)  // returns 401/403 NextResponse or null
```

`requireInternalUser` is applied to all admin/edit API routes:
- `POST /api/event`
- `PATCH /api/event/[id]/edit`
- `POST /api/event/[id]/shiftkind`
- `POST /api/event/[id]/shift`
This is temporary and will be split into 
`requireInternalUser & requirePlannerUser`

The edit page itself redirects guests to the event overview instead of showing an error.

---

## Email Sending

not yet implemented


## Internal Shift Entry Link (Edit Page)

Shown on the event edit page. It is the SSO sign-in URL with `callbackUrl` pointing to the event overview:

```
/api/auth/signin/oidc?callbackUrl=/events/<eventId>
```

The link is used for internal people to register for shifts. The Login button is hidden to reduce the confusion of guest users, which are the intended majority users of the platform.
