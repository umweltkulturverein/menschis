import { getServerSession } from "next-auth";
import { GetPersonBySub, Person } from "@/lib/db/persons";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/nextauth";

export async function getAuthenticatedPerson(): Promise<NextResponse | Person> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const person = await GetPersonBySub(session.user.id);
  if (!person) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 });
  }
  return person;
}
