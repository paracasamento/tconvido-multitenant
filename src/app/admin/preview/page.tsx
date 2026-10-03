import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { GiftCard } from "@/components/GiftCard";
import { InviteCanvas } from "@/components/invite/InviteCanvas";
import { InviteContinuousFlow } from "@/components/invite/InviteContinuousFlow";
import { AccessFormView } from "@/components/invite/functional/AccessFormView";
import { CountdownView } from "@/components/invite/functional/CountdownView";
import { GiftGridView } from "@/components/invite/functional/GiftGridView";
import { GiftNoteView } from "@/components/invite/functional/GiftNoteView";
import { RsvpFlowView, type RsvpPreviewState } from "@/components/invite/functional/RsvpFlowView";
import {
  resolveRsvpScenarioScreen,
  type InviteScreen,
  type RsvpScenarioId,
} from "@/lib/invite-builder";
import { getInviteVisualConfig } from "@/lib/invite-builder-server";
import { getInviteEditorPreviewData } from "@/lib/invite-editor-preview";
import { getEventCapabilities } from "@/lib/event-capabilities";
import { requireAdmin } from "@/lib/sessions";

export const dynamic = "force-dynamic";

function previewSlots(
  screen: InviteScreen,
  previewData: Awaited<ReturnType<typeof getInviteEditorPreviewData>>,
  rsvpState: RsvpPreviewState,
  giftsEnabled: boolean,
  countdownEnabled: boolean
) {
  const slots: Record<string, ReactNode> = {};

  for (const element of screen.elements) {
    if (element.type !== "slot" || !element.slot) continue;

    if (element.slot === "access-form") {
      slots[element.slot] = (
        <AccessFormView
          key={element.id}
          parts={element.partStyles}
          name={previewData.vars.guest_name || "Convidado"}
          code=""
          preview
        />
      );
      continue;
    }

    if (element.slot === "rsvp-flow") {
      slots[element.slot] = (
        <RsvpFlowView
          key={element.id}
          parts={element.partStyles}
          maxAdults={previewData.guestAllowedAdults}
          allowChildren={previewData.guestAllowedChildren > 0}
          maxChildren={previewData.guestAllowedChildren}
          preview
          previewState={rsvpState}
        />
      );
      continue;
    }

    if (element.slot === "gift-grid" && giftsEnabled) {
      slots[element.slot] = previewData.gifts.length ? (
        <GiftGridView key={element.id} parts={element.partStyles} preview>
          {previewData.gifts.map(gift => (
            <GiftCard
              key={gift.id}
              gift={gift}
              preview
              parts={element.partStyles}
            />
          ))}
        </GiftGridView>
      ) : (
        <div className="guest-state-card">
          <h2>A lista ainda está sendo preparada.</h2>
          <p>Os presentes aparecerão aqui quando forem cadastrados.</p>
        </div>
      );
      continue;
    }

    if (element.slot === "gift-note" && giftsEnabled) {
      slots[element.slot] = (
        <GiftNoteView key={element.id} parts={element.partStyles} preview />
      );
      continue;
    }

    if (element.slot === "countdown" && countdownEnabled && previewData.vars.event_datetime) {
      slots[element.slot] = (
        <CountdownView
          key={element.id}
          target={previewData.vars.event_datetime}
          parts={element.partStyles}
        />
      );
    }
  }

  return slots;
}

export default async function AdminPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const session = await requireAdmin("/admin/preview");
  const params = await searchParams;

  const [config, previewData, capabilities] = await Promise.all([
    getInviteVisualConfig(session.event_id),
    getInviteEditorPreviewData(session.event_id),
    getEventCapabilities(session.event_id),
  ]);

  const rsvpEnabled = capabilities.includes("rsvp");
  const giftsEnabled = capabilities.includes("gifts");
  const countdownEnabled = capabilities.includes("countdown");

  const allowedViews = new Set(["cover", "access", "invite", "rsvp", "after"]);
  const requestedView = allowedViews.has(params.view || "") ? params.view! : "invite";
  const view = requestedView === "rsvp" && !rsvpEnabled
    ? "invite"
    : requestedView === "after" && !giftsEnabled
      ? "invite"
      : requestedView;

  const rsvpState: RsvpPreviewState =
    previewData.guestAllowedChildren > 0 ? "children-question" : "form-no-children";

  const inviteBase =
    view === "after" && config.inviteFlow?.afterInviteScreen
      ? config.inviteFlow.afterInviteScreen
      : config.screens.invite;

  const inviteScreen: InviteScreen = {
    ...inviteBase,
    elements: inviteBase.elements
      .filter(element => {
        if (element.id === "invite-gifts") return false;
        if (element.id === "invite-rsvp" && !rsvpEnabled) return false;
        if (element.slot === "countdown" && !countdownEnabled) return false;
        if (view === "after" && element.id === "invite-rsvp") return false;
        return true;
      })
      .map(element => {
        if (view !== "after" && element.id === "invite-rsvp") {
          return { ...element, x: (100 - element.width) / 2 };
        }
        return element;
      }),
  };

  const rsvpScreen = resolveRsvpScenarioScreen(
    config,
    rsvpState as RsvpScenarioId
  );

  const tabs = [
    { id: "cover", label: "Capa" },
    { id: "access", label: "Acesso" },
    { id: "invite", label: "Convite" },
    ...(rsvpEnabled ? [{ id: "rsvp", label: "RSVP" }] : []),
    ...(giftsEnabled ? [{ id: "after", label: "Após confirmação" }] : []),
  ];

  let content: ReactNode;

  if (view === "cover") {
    content = (
      <InviteCanvas
        screen={config.screens.cover}
        vars={previewData.vars}
        className="visual-invite-cover"
      />
    );
  } else if (view === "access") {
    content = (
      <InviteCanvas
        screen={config.screens.access}
        vars={previewData.vars}
        slots={previewSlots(
          config.screens.access,
          previewData,
          rsvpState,
          giftsEnabled,
          countdownEnabled
        )}
      />
    );
  } else if (view === "rsvp") {
    content = (
      <InviteCanvas
        screen={rsvpScreen}
        vars={previewData.vars}
        slots={previewSlots(
          rsvpScreen,
          previewData,
          rsvpState,
          giftsEnabled,
          countdownEnabled
        )}
      />
    );
  } else if (view === "after" && giftsEnabled) {
    const giftsScreen = config.screens.gifts;
    const continuous = config.inviteFlow?.continuousBackground === true;

    if (continuous) {
      content = (
        <InviteContinuousFlow
          backgroundScreen={
            config.inviteFlow?.backgroundSource === "gifts"
              ? giftsScreen
              : inviteScreen
          }
          sections={[
            {
              key: "invite",
              screen: inviteScreen,
              vars: previewData.vars,
              slots: previewSlots(
                inviteScreen,
                previewData,
                rsvpState,
                giftsEnabled,
                countdownEnabled
              ),
            },
            {
              key: "gifts",
              screen: giftsScreen,
              vars: previewData.vars,
              slots: previewSlots(
                giftsScreen,
                previewData,
                rsvpState,
                giftsEnabled,
                countdownEnabled
              ),
            },
          ]}
        />
      );
    } else {
      content = (
        <>
          <InviteCanvas
            screen={inviteScreen}
            vars={previewData.vars}
            slots={previewSlots(
              inviteScreen,
              previewData,
              rsvpState,
              giftsEnabled,
              countdownEnabled
            )}
          />
          <InviteCanvas
            screen={giftsScreen}
            vars={previewData.vars}
            slots={previewSlots(
              giftsScreen,
              previewData,
              rsvpState,
              giftsEnabled,
              countdownEnabled
            )}
          />
        </>
      );
    }
  } else {
    content = (
      <InviteCanvas
        screen={inviteScreen}
        vars={previewData.vars}
        slots={previewSlots(
          inviteScreen,
          previewData,
          rsvpState,
          giftsEnabled,
          countdownEnabled
        )}
      />
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "116px 18px 56px",
        background: "#171a22",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: "0 0 auto 0",
          zIndex: 1000,
          padding: "10px 14px 12px",
          display: "grid",
          gap: 9,
          background: "rgba(23,26,34,.96)",
          borderBottom: "1px solid rgba(255,255,255,.10)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Link
            href="/admin/convite"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              color: "#fff",
              textDecoration: "none",
              font: "700 12px Arial, sans-serif",
            }}
          >
            <ArrowLeft size={15} />
            Voltar ao painel
          </Link>
          <span style={{ color: "rgba(255,255,255,.58)", font: "600 10px Arial, sans-serif" }}>
            Prévia real · sem edição
          </span>
        </div>

        <nav
          aria-label="Telas da prévia"
          style={{
            display: "flex",
            gap: 7,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          {tabs.map(tab => (
            <Link
              key={tab.id}
              href={`/admin/preview?view=${tab.id}`}
              style={{
                flex: "0 0 auto",
                padding: "7px 10px",
                borderRadius: 999,
                textDecoration: "none",
                font: "700 10px Arial, sans-serif",
                background: view === tab.id ? "#fff" : "rgba(255,255,255,.08)",
                color: view === tab.id ? "#171a22" : "#fff",
              }}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <div style={{ width: "min(430px, 100%)", margin: "0 auto" }}>
        {content}
      </div>
    </main>
  );
}
