import {
  getDefaultCapabilities,
  isEventType,
  type EventCapability,
} from "@/lib/event-types";

export type EventValidationIssue = {
  key: string;
  label: string;
  severity: "required" | "recommended";
};

export function validateEventReadiness(event: any): EventValidationIssue[] {
  const issues: EventValidationIssue[] = [];
  const configured: EventCapability[] = Array.isArray(event.enabled_capabilities)
    ? event.enabled_capabilities.filter((value: unknown): value is EventCapability => typeof value === "string")
    : [];
  const eventType = String(event.event_type || "");
  const caps =
    configured.length === 0 && isEventType(eventType)
      ? getDefaultCapabilities(eventType)
      : configured;

  const required = (key: string, label: string, ok: boolean) => {
    if (!ok) issues.push({ key, label, severity: "required" });
  };
  const recommended = (key: string, label: string, ok: boolean) => {
    if (!ok) issues.push({ key, label, severity: "recommended" });
  };

  const identity =
    event.event_name ||
    event.celebrant_name ||
    event.baby_name ||
    event.hosts_names ||
    event.couple_names;

  required("identity", "Identidade principal do evento", Boolean(identity));
  required("title", "Título do convite", Boolean(String(event.title || "").trim()));

  if (caps.includes("date") || caps.includes("calendar") || caps.includes("countdown")) {
    required("date", "Data do evento", Boolean(event.event_date));
  }

  if (caps.includes("location")) {
    required("location", "Local do evento", Boolean(event.venue || event.city));
  }

  if (caps.includes("date")) {
    recommended("time", "Horário do evento", Boolean(event.event_time));
  }

  if (caps.includes("countdown")) {
    required(
      "countdown_datetime",
      "Data e horário para a contagem regressiva",
      Boolean(event.event_date && event.event_time)
    );
  }

  recommended(
    "delivery_deadline",
    "Prazo interno de entrega",
    Boolean(event.delivery_deadline)
  );

  if (caps.includes("rsvp")) {
    recommended(
      "rsvp_deadline",
      "Prazo de confirmação",
      Boolean(event.rsvp_deadline)
    );
  }

  if (caps.includes("gifts")) {
    recommended(
      "gift_deadline",
      "Prazo da lista de presentes",
      Boolean(event.gift_deadline)
    );
  }

  return issues;
}
