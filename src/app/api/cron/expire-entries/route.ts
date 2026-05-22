import { NextRequest, NextResponse } from "next/server";
import {
    DeleteShiftEntryById,
    GetExpiredPendingEntries,
    VERIFY_WINDOW_MS,
} from "@/lib/db/shiftEntries";
import { CancelOrder } from "@/lib/ticket/pretix";

// Only accept calls that did not pass through a reverse proxy. The cron sidecar
// shares the Pod network namespace and hits the app directly, so its request
// carries no forwarding headers. Traefik (and any other ingress/proxy) injects
// these on every external request, so their presence means the call came from
// outside the Pod and is rejected.
function isInternalRequest(req: NextRequest): boolean {
    return !(
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        req.headers.get("x-forwarded-host") ||
        req.headers.get("forwarded")
    );
}

// Cancels and removes sign-ups that were never confirmed within the verify window
export async function GET(req: NextRequest) {
    if (!isInternalRequest(req)) {
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
