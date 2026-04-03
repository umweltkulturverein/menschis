import type { NextAuthOptions } from "next-auth";
import { db } from "@/db";

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
        async session({ session, token }) {
            if (token.sub) {
                session.user.id = token.sub;
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

            await db
                .insertInto("person")
                .values({
                    sub,
                    name,
                    email,
                    phone,
                    roles: null,
                })
                .onConflict((oc) =>
                    oc.column("sub").doUpdateSet({
                        name,
                        email,
                        phone,
                    }),
                )
                .execute();

            return true;
        },
    },
};
