import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { GetPersonByLoginToken } from "@/lib/db/persons";

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
        return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }
    const person = await GetPersonByLoginToken(token);
    if (!person) {

        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const useSecureCookies =
        process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
    const cookieName = useSecureCookies
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token";

    const sessionToken = await encode({
        token: {
            name: person.name,
            email: person.email,
            sub: person.sub,
            shiftAccess: {},
        },
        secret: process.env.NEXTAUTH_SECRET!,
        maxAge: 30 * 24 * 60 * 60, // 30 Days
    });
    console.log(sessionToken)

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
