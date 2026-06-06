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


export function isAdminUser(user: Session | null): boolean {
  const adminGroup = process.env.OIDC_ADMIN_GROUP ?? "admin";
  return !!user?.user?.roles?.includes(adminGroup);
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
