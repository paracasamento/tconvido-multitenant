import { redirect } from "next/navigation";
import { RsvpScenarioCanvas } from "@/components/invite/functional/RsvpScenarioCanvas";
import type { CurrentRsvpSubmission } from "@/components/invite/functional/RsvpFlowView";
import { requireInvite } from "@/lib/invite-session";
import {
  getGuestRsvpSnapshot,
  getGuestSession,
  getRsvpSubmissionSession
} from "@/lib/sessions";
import { getPublicInvitePageData } from "@/lib/public-invite-data";
import { buildEventTemplateVars } from "@/lib/event";

export default async function RsvpPage() {
  const invite = await requireInvite("/presenca");
  const [pageData, submissionSession, guestSession] = await Promise.all([
    getPublicInvitePageData("rsvp", invite.event_id),
    getRsvpSubmissionSession(),
    getGuestSession(),
  ]);
  if (!pageData?.config) return null;
  if (pageData.event.status !== "active") redirect("/acesso");

  if (
    !guestSession ||
    guestSession.event_id !== invite.event_id ||
    !invite.guest_id ||
    invite.guest_id !== guestSession.guest_id
  ) {
    redirect("/acesso?next=%2Fpresenca");
  }

  let initialSubmission: CurrentRsvpSubmission | null = null;
  if (
    guestSession.event_id === invite.event_id &&
    guestSession.rsvp_status === "confirmed"
  ) {
    const snapshot = await getGuestRsvpSnapshot(
      guestSession.guest_id,
      invite.event_id
    );

    if (snapshot) {
      const matchingSubmission =
        submissionSession?.event_id === invite.event_id &&
        submissionSession.guest_id === guestSession.guest_id
          ? submissionSession
          : null;

      initialSubmission = {
        id: matchingSubmission?.submission_id || guestSession.guest_id,
        submitted_name: String(
          matchingSubmission?.submitted_name ||
          snapshot.submitted_name ||
          snapshot.name ||
          guestSession.guest_name
        ),
        adults_count: Math.max(1, Number(snapshot.confirmed_adults || 1)),
        has_children: Number(snapshot.confirmed_children || 0) > 0,
        children_count: Number(snapshot.confirmed_children || 0),
      };
    }
  }

  return (
    <RsvpScenarioCanvas
      config={pageData.config}
      initialSubmission={initialSubmission}
      identityName={guestSession.guest_name}
      maxAdults={guestSession.allowed_adults}
      allowChildren={guestSession.allowed_children > 0}
      maxChildren={guestSession.allowed_children}
      vars={buildEventTemplateVars(pageData.event, {
        guest_name: guestSession.guest_name,
      })}
    />
  );
}
