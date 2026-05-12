import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import {GetPersonByLoginToken, GetPersonBySub} from "@/lib/db/persons";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {db} from "@/db";


async function validateAuthorizedShifts(shiftId: number, shiftSecret: string): Promise<boolean> {
    if (Number.isNaN(shiftId)|| shiftSecret === "") return false;

    const res = await db.selectFrom("shiftKind").where("id", "=", shiftId).where("authorizationMagicLinkToken", "=", shiftSecret).execute()
    return res.length >= 1;
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { error: "Not Logged in" },
            { status: 401 },
    );
    }

    const shiftAccessPermissions = req.nextUrl.searchParams.get("shiftaccess");
    let Permissions: Record<number, string> = {};
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
    Permissions = { [shiftId]: shiftSecret };

    const useSecureCookies =
        process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
    const cookieName = useSecureCookies
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token";

    const sessionToken = await encode({
        token: {
            name: session.user.name,
            email: session.user.email,
            sub: session.user.sub ?? "",
            shiftAccess: Permissions,
        },
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
