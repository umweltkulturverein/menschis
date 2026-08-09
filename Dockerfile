# next build crashes under every Bun 1.2.19-1.3.14: <=1.3.4 can't load the
# native Turbopack binary, >=1.3.5 dies in Bun's CJS loader. Node builds and
# serves; Bun is kept for installs so bun.lock stays authoritative.
FROM node:26-slim AS base
COPY --from=oven/bun:1.3.14 /usr/local/bin/bun /usr/local/bin/bun

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
RUN node node_modules/.bin/next build

# Production image, copy all the files and run next
FROM node:26-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nextjs \
 && useradd --system --uid 1001 --gid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nextjs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

COPY --from=deps --chown=nextjs:nextjs /app/node_modules/kysely ./node_modules/kysely

USER nextjs

EXPOSE 3000

ENV PORT=3000

# Set hostname to localhost
ENV HOSTNAME="0.0.0.0"


# exec server as PID 1 so it receives SIGTERM for clean shutdown.
CMD ["node", "server.js"]
