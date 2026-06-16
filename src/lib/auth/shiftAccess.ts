import { encode, decode } from "next-auth/jwt";
import { cookies } from "next/headers";

// Shift authorization is stored in its own signed cookie, independent of the
// next-auth session. This lets a magic-link holder gain access to a shift
// kind whether or not they are logged in.

const useSecureCookies =
  process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;

export const SHIFT_ACCESS_COOKIE = useSecureCookies
  ? "__Secure-shift-access"
  : "shift-access";

const MAX_AGE = 90 * 24 * 60 * 60; // 90 Days

export const shiftAccessCookieOptions = {
  httpOnly: true,
  secure: useSecureCookies,
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

export type ShiftAccess = Record<number, string>; // shiftKindID + Token

export async function encodeShiftAccess(access: ShiftAccess): Promise<string> {
  return encode({
    token: { shiftAccess: access },
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: MAX_AGE,
  });
}

export async function decodeShiftAccess(
  raw: string | undefined,
): Promise<ShiftAccess> {
  if (!raw) return {};
  const token = await decode({
    token: raw,
    secret: process.env.NEXTAUTH_SECRET!,
  });
  return (token?.shiftAccess as ShiftAccess | undefined) ?? {};
}

// Reads the granted shift access from the request cookie store. Usable from
// server components and route handlers.
export async function readShiftAccess(): Promise<ShiftAccess> {
  const store = await cookies();
  return decodeShiftAccess(store.get(SHIFT_ACCESS_COOKIE)?.value);
}
