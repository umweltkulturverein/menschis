import { NextRequest, NextResponse } from "next/server";
import { encode, getToken } from "next-auth/jwt";
import { db } from "@/db";

async function validateAuthorizedShifts(shiftId: number, shiftSecret: string): Promise<boolean> {
    if (Number.isNaN(shiftId)|| shiftSecret === "") return false;

    const res = await db.selectFrom("shiftKind")
        .where("id", "=", shiftId)
        .where("authorizationMagicLinkToken", "=", shiftSecret)
        .execute()
    return res.length >= 1;
}

export async function GET(req: NextRequest) {
    // Decode the caller's existing session so we can extend it rather than
    // replace it — keeps their identity (sub) and roles intact.
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET!,
    });
    if (!token) {
        return NextResponse.json(
            { error: "Not Logged in" },
            { status: 401 },
    );
    }

    const shiftAccessPermissions = req.nextUrl.searchParams.get("shiftaccess");
    if (!shiftAccessPermissions) {
        return NextResponse.json(
            { error: "Not a Valid Request. shiftaccess unset" },
            { status: 401 },
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

    // Merge the new grant into whatever access the session already holds.
    const existingAccess = (token.shiftAccess as Record<number, string>) ?? {};
    const shiftAccess = { ...existingAccess, [shiftId]: shiftSecret };

    const useSecureCookies =
        process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
    const cookieName = useSecureCookies
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token";

    const sessionToken = await encode({
        token: { ...token, shiftAccess },
        secret: process.env.NEXTAUTH_SECRET!,
        maxAge: 30 * 24 * 60 * 60, // 30 Days
    });

    const redirectParam = req.nextUrl.searchParams.get("redirect");
    const redirectPath =
        redirectParam && redirectParam.startsWith("/") ? redirectParam : "/";
    const redirectUrl = new URL(redirectPath, req.nextUrl.origin);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(cookieName, sessionToken, {
        httpOnly: true,
        secure: useSecureCookies,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 Days
    });

    return response;
}
