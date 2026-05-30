import { Session } from "next-auth";
import { Person } from "../db/persons";
import { NextResponse } from "next/server";

export function isInternalUser(session: Session | null): boolean {
  return !!(session?.user?.id && !session.user.id.startsWith("email:"));
}

export function requireInternalUser(
  session: Session | null,
): NextResponse | null {
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isInternalUser(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

function getRoles(user: Session | Person): string[] {
  return ("user" in user ? user.user?.roles : user.roles) ?? [];
}

export function isAdminUser(user: Session | Person | null): boolean {
  const adminGroup = process.env.OIDC_ADMIN_GROUP ?? "admin";
  if (user) {
    console.log(adminGroup, getRoles(user));
  }
  return !!user && getRoles(user).includes(adminGroup);
}

export function requireAdminUser(session: Session | null): NextResponse | null {
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminUser(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
