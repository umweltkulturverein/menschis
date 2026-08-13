import EventShiftBoard from "@/components/Events/EventShiftBoard";

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ event: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { event: eventId } = await params;
  return <EventShiftBoard eventId={eventId} searchParams={await searchParams} />;
}
