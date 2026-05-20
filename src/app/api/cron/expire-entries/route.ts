import { NextRequest, NextResponse } from "next/server";
import {
    DeleteShiftEntryById,
    GetExpiredPendingEntries,
    VERIFY_WINDOW_MS,
} from "@/lib/db/shiftEntries";
import { CancelOrder } from "@/lib/ticket/pretix";

// Only accept calls originating from inside the container (the in-container
// cron curls 127.0.0.1 directly). Requests proxied from outside carry
// forwarding headers and/or a non-loopback Host, so they are rejected.
function isLoopbackRequest(req: NextRequest): boolean {
    if (
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        req.headers.get("forwarded")
    ) {
        return false;
    }
    const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
    return host === "127.0.0.1" || host === "localhost" || host === "::1";
}

// Cancels and removes sign-ups that were never confirmed within the verify
// window. Driven by the in-container cron (see docker/crontab), reachable only
// from localhost.
export async function GET(req: NextRequest) {
    if (!isLoopbackRequest(req)) {
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

    return NextResponse.json({ scanned: expired.length, cancelled, deleted, failed });
}
