import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { GetPersonBySub, type Person } from "@/lib/db/persons";

export const authOptions: NextAuthOptions = {
    // http://localhost:3000/api/auth/callback/oidc
    providers: [
        {
            id: "oidc",
            name: "SSO",
            type: "oauth",
            wellKnown: `${process.env.OIDC_ISSUER}/.well-known/openid-configuration`,
            clientId: process.env.OIDC_CLIENT_ID,
            clientSecret: process.env.OIDC_CLIENT_SECRET,
            authorization: { params: { scope: "openid email profile" } },
            checks: ["pkce", "state"],
            client: {
                token_endpoint_auth_method: process.env.OIDC_CLIENT_SECRET
                    ? "client_secret_basic"
                    : "none",
            },
            profile(profile) {
                return {
                    id: profile.sub,
                    name:
                        profile.name ??
                        profile.preferred_username ??
                        profile.sub,
                    email: profile.email,
                    image: profile.picture ?? null,
                };
            },
        },
    ],
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token }) {
            return token;
        },
        async session({ session, token }) {
            if (token.sub) {
                session.user.id = token.sub;
            }
            if (token.shiftAccess) {
                session.user.shiftAccess = token.shiftAccess as Record<number, string>;
            }
            return session;
        },
        async signIn({ user, profile }) {
            const rawProfile = profile as {
                sub?: string;
                phone_number?: string;
            };
            const sub = rawProfile?.sub;
            if (!sub) return true;

            const name = user.name ?? sub;
            const email = user.email ?? null;
            const phone = rawProfile.phone_number ?? null;
            const loginToken = crypto.randomUUID();

            await db
                .insertInto("person")
                .values({
                    sub,
                    name,
                    email,
                    phone,
                    loginToken,
                    roles: null,
                })
                .onConflict((oc) =>
                    oc.column("sub").doUpdateSet((eb) => ({
                        name,
                        email,
                        phone,
                        loginToken: eb.fn.coalesce(
                            eb.ref("person.loginToken"),
                            eb.val(loginToken),
                        ),
                    })),
                )
                .execute();

            return true;
        },
    },
};

