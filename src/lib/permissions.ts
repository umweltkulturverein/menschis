import { Session } from "next-auth";
import { NextResponse } from "next/server";

/**
 * Returns true for SSO-authenticated users.
 * Guest users (email sign-up) have a sub prefixed with "email:" and are not internal.
 */
export function isInternalUser(session: Session | null): boolean {
    return !!(session?.user?.id && !session.user.id.startsWith("email:"));
}

/**
 * Use in API route handlers. Returns a 401/403 response if the user is not
 * an internal (SSO) user, or null if the check passes.
 */
export function requireInternalUser(session: Session | null): NextResponse | null {
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isInternalUser(session)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return null;
}
