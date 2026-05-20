FROM oven/bun AS base

# Install dependencies only when needed
FROM base AS deps

WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=postgresql://db
RUN bun run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN useradd --system --uid 1001 nextjs

# Plain cron to drive the shift-entry expiry sweep. It runs as the unprivileged
# nextjs user handling only its own crontab, so no root/privilege escalation is
# needed. Make the spool dir owned by nextjs so the daemon can read it.
RUN apt-get update \
    && apt-get install -y --no-install-recommends cron \
    && rm -rf /var/lib/apt/lists/* \
    && chown nextjs /var/spool/cron/crontabs

# Crontab: hit the loopback-only expiry endpoint every 5 minutes; job output
# goes to the container's stdout (PID 1).
RUN printf 'PATH=/usr/local/bin:/usr/bin:/bin\n*/5 * * * * bun -e "fetch('"'"'http://127.0.0.1:3000/api/cron/expire-entries'"'"').then(r=>r.text()).then(t=>console.log(t)).catch(e=>console.error(e))" > /proc/1/fd/1 2>&1\n' > /tmp/menschis.cron \
    && crontab -u nextjs /tmp/menschis.cron \
    && rm /tmp/menschis.cron

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:bun .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:bun /app/.next/standalone ./
COPY --from=builder --chown=nextjs:bun /app/.next/static ./.next/static

RUN bun add kysely

USER nextjs

EXPOSE 3000

ENV PORT=3000

# Set hostname to localhost
ENV HOSTNAME="0.0.0.0"


# exec server PID 1 so it receives SIGTERM for clean shutdown.
CMD ["/bin/sh", "-c", "/usr/sbin/cron -f & exec bun server.js"]
