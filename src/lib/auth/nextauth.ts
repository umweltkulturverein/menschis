import type { NextAuthOptions } from "next-auth";
import { db } from "@/db";

const rolesClaim = process.env.OIDC_ROLES_CLAIM ?? "groups";

function extractRoles(
  profile: Record<string, unknown> | null | undefined,
): string[] | null {
  if (!profile) return null;
  const value = profile[rolesClaim];
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  if (typeof value === "string") return [value];
  return null;
}

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
      authorization: {
        params: { scope: `openid email profile ${rolesClaim}` },
      },
      checks: ["pkce", "state"],
      client: {
        token_endpoint_auth_method: process.env.OIDC_CLIENT_SECRET
          ? "client_secret_basic"
          : "none",
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username ?? profile.sub,
          email: profile.email,
          roles: extractRoles(profile),
          image: profile.picture ?? null,
        };
      },
    },
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, profile }) {
      if (user && "roles" in user) {
        token.roles = (user as { roles?: string[] | null }).roles ?? null;
      } else if (profile) {
        token.roles = extractRoles(profile as Record<string, unknown>);
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.roles !== undefined) {
        session.user.roles = token.roles as string[] | null;
      }
      return session;
    },
    async signIn({ user, profile }) {
      console.log(profile);
      const rawProfile = profile as {
        sub?: string;
        phone_number?: string;
      } & Record<string, unknown>;
      const sub = rawProfile?.sub;
      if (!sub) return true;

      const name = user.name ?? sub;
      const roles = extractRoles(rawProfile);
      const email = user.email;
      const phone = rawProfile.phone_number ?? null;
      const loginToken = crypto.randomUUID();
      if (!email || email == "") {
        return false;
      }
      await db
        .insertInto("person")
        .values({
          sub,
          name,
          email,
          phone,
          loginToken,
          roles,
        })
        .onConflict((oc) =>
          oc.column("sub").doUpdateSet((eb) => ({
            name,
            email,
            phone,
            roles,
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
