"use client";

import { useEffect, useMemo, useState } from "react";
import { InviteCanvas } from "@/components/invite/InviteCanvas";
import {
  RsvpFlowView,
  type CurrentRsvpSubmission,
  type RsvpPreviewState,
} from "@/components/invite/functional/RsvpFlowView";
import {
  resolveRsvpScenarioScreen,
  type InviteVisualConfig,
  type RsvpScenarioId,
} from "@/lib/invite-builder";

export function RsvpScenarioCanvas({
  config,
  initialSubmission,
  identityName,
  eventType = "wedding",
  vars = {},
}: {
  config: InviteVisualConfig;
  initialSubmission: CurrentRsvpSubmission | null;
  identityName: string;
  eventType?: string;
  vars?: Record<string, string | undefined>;
}) {
  const [state, setState] = useState<RsvpPreviewState>(
    initialSubmission ? "confirmed" : eventType === "wedding" ? "children-question" : "form-no-children"
  );

  const screen = useMemo(
    () => resolveRsvpScenarioScreen(config, state as RsvpScenarioId),
    [config, state]
  );

  const flowSlot = screen.elements.find(element => element.slot === "rsvp-flow");

  useEffect(() => {
    if (state !== "confirmed") return;

    const timer = window.setTimeout(() => {
      window.location.replace("/convite");
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [state]);

  return (
    <InviteCanvas
      screen={screen}
      vars={vars}
      slots={{
        "rsvp-flow": (
          <RsvpFlowView
            key={`rsvp-flow-${state}`}
            parts={flowSlot?.partStyles}
            initialSubmission={initialSubmission}
            identityName={identityName}
            allowChildren={eventType === "wedding"}
            controlledState={state}
            onStateChange={setState}
          />
        ),
      }}
    />
  );
}
