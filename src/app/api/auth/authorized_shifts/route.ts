import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
    SHIFT_ACCESS_COOKIE,
    encodeShiftAccess,
    readShiftAccess,
    shiftAccessCookieOptions,
} from "@/lib/auth/shiftAccess";

async function validateAuthorizedShifts(shiftId: number, shiftSecret: string): Promise<boolean> {
    if (Number.isNaN(shiftId)|| shiftSecret === "") return false;

    const res = await db.selectFrom("shiftKind")
        .where("id", "=", shiftId)
        .where("authorizationMagicLinkToken", "=", shiftSecret)
        .execute()
    return res.length >= 1;
}

export async function GET(req: NextRequest) {
    const shiftAccessPermissions = req.nextUrl.searchParams.get("shiftaccess");
    if (!shiftAccessPermissions) {
        return NextResponse.json(
            { error: "Not a Valid Request. shiftaccess unset" },
            { status: 400 },
        );
    }
    const perms = shiftAccessPermissions.split(":");
    const shiftId = Number(perms[0])
    const shiftSecret = perms[1]

    if (!await validateAuthorizedShifts(shiftId, shiftSecret)) {
        return NextResponse.json(
            { error: "shiftaccess uses an invalid token so the authorization cannot be granted" },
            { status: 422 },
        );
    }

    // Grant is kept in its own cookie, independent of the login session: a
    // magic-link holder gains shift access whether or not they are logged in.
    const existing = await readShiftAccess();
    const shiftAccess = { ...existing, [shiftId]: shiftSecret };
    const sessionToken = await encodeShiftAccess(shiftAccess);

    const redirectParam = req.nextUrl.searchParams.get("redirect");
    const redirectPath =
        redirectParam && redirectParam.startsWith("/") ? redirectParam : "/";
    const redirectUrl = new URL(redirectPath, req.nextUrl.origin);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(SHIFT_ACCESS_COOKIE, sessionToken, shiftAccessCookieOptions);

    return response;
}
