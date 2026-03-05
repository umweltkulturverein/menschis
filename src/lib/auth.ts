import type { NextAuthOptions } from "next-auth";

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
            idToken: true,
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
};
