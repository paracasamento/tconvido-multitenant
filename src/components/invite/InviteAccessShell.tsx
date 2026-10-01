import { AccessForm } from "@/components/AccessForm";
import { InviteCanvas } from "@/components/invite/InviteCanvas";
import type { InviteScreen } from "@/lib/invite-builder";

export function InviteAccessShell({
  screen,
  redirectTo = "/convite",
  eventSlug,
  vars = {},
}: {
  screen: InviteScreen;
  redirectTo?: string;
  eventSlug: string;
  vars?: Record<string, string | undefined>;
}) {
  const slot = screen.elements.find(
    element => element.slot === "access-form"
  );

  return (
    <InviteCanvas
      screen={screen}
      vars={vars}
      slots={{
        "access-form": (
          <AccessForm
            key="access-form"
            parts={slot?.partStyles}
            redirectTo={redirectTo}
            eventSlug={eventSlug}
          />
        )
      }}
    />
  );
}