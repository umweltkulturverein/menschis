# Menschis - Schichtplanungs-Tool für Festivals

**Menschis** ist ein modernes Schichtplanungs-Tool für Festivals, das als Alternative zu Signup entwickelt wurde. Es bietet eine integrierte Lösung für die Planung, Verwaltung und Kommunikation von Schichten während Veranstaltungen.

## Stack

Next.js · React · Postgres w.  Kysely · NextAuth (OIDC) · Umami integration ·
next-intl (de/en) · Tailwind CSS · optional Pretix ticketing, Cloudflare
Turnstile and SMTP mail.

## Development

```bash
bun install
cp env.example .env   # at minimum: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
bun run dev
```

Migrations run automatically on server start (`src/instrumentation.ts`), so a
fresh database is set up on first boot.

## Docs

- [docs/architecture.md](docs/architecture.md) — concepts, data model, access control
- [docs/magiclinks.md](docs/auth.md) — authentication, guest sign-up and confirmation flow
- [docs/eventDays.md](docs/eventDays.md) — multi-day events and ticketshop wiring
