import { notFound } from "next/navigation";
import { InviteEntryFlow } from "@/components/invite/InviteEntryFlow";
import { getEventBySlug } from "@/lib/event";
import { getInviteVisualConfig } from "@/lib/invite-builder-server";

export const dynamic = "force-dynamic";

export default async function EventEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const config = await getInviteVisualConfig(event.id);

  return (
    <InviteEntryFlow
      coverScreen={config.screens.cover}
      accessScreen={config.screens.access}
      eventSlug={event.slug}
    />
  );
}
