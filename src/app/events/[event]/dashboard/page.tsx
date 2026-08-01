import { getServerSession } from "next-auth";
import { redirect, RedirectType } from "next/navigation";
import { authOptions } from "@/lib/auth/nextauth";
import { isAdminUser } from "@/lib/auth/permissions";
import EventShiftBoard from "@/components/Events/EventShiftBoard";

/** Admin view of an event: the same shift board, but every entry shown in full
 *  (name, contact data, notes, sign-up time). Non-admins are sent back to the
 *  public overview — `ShiftSummary` re-checks the same gate before it loads any
 *  contact data. */
export default async function EventDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ event: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { event: eventId } = await params;
  const session = await getServerSession(authOptions);
  if (!isAdminUser(session)) {
    redirect(`/events/${eventId}`, RedirectType.replace);
  }
  return (
    <EventShiftBoard
      eventId={eventId}
      searchParams={await searchParams}
      dashboard
    />
  );
}
