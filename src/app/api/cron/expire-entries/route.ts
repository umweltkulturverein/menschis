import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import {
  DeleteShiftEntryById,
  GetExpiredPendingEntries,
  VERIFY_WINDOW_MS,
} from "@/lib/db/shiftEntries";
import { CancelOrder } from "@/lib/ticket/pretix";

// Authenticate the cron sidecar with a shared secret. Header sniffing is not
// usable here: Next.js synthesizes x-forwarded-* headers on every request, so
// there is no way to distinguish an in-Pod loopback call from a proxied one.
// The sidecar sends `Authorization: Bearer <CRON_SECRET>` instead.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Cancels and removes sign-ups that were never confirmed within the verify window
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cutoff = new Date(Date.now() - VERIFY_WINDOW_MS);
  const expired = await GetExpiredPendingEntries(cutoff);

  let cancelled = 0;
  let deleted = 0;
  let failed = 0;

  for (const entry of expired) {
    if (entry.order && entry.shopEventId) {
      try {
        // Cancel the Pretix order first; only delete the row on success
        // so a failed cancel is retried on the next sweep.
        await CancelOrder(entry.shopEventId, entry.order);
        cancelled++;
      } catch (e) {
        console.error(
          `Failed to cancel order ${entry.order} for entry ${entry.id}: ${(e as Error).message}`,
        );
        failed++;
        continue;
      }
    }
    await DeleteShiftEntryById(entry.id);
    deleted++;
  }

  return NextResponse.json({
    scanned: expired.length,
    cancelled,
    deleted,
    failed,
  });
}
