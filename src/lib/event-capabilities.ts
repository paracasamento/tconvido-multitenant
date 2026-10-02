import { db } from "@/lib/db";
import { getDefaultCapabilities, isEventType, type EventCapability } from "@/lib/event-types";

export async function getEventCapabilities(eventId: string): Promise<EventCapability[]> {
  const rows = await db()`
    SELECT event_type, enabled_capabilities
    FROM events
    WHERE id = ${eventId}
    LIMIT 1
  `;

  if (!rows.length) return [];

  const eventType = String(rows[0].event_type || "");
  const configured = Array.isArray(rows[0].enabled_capabilities)
    ? rows[0].enabled_capabilities.filter(
        (value): value is EventCapability => typeof value === "string"
      )
    : [];

  // Compatibility for events created before capability defaults were persisted.
  if (configured.length === 0 && isEventType(eventType)) {
    return getDefaultCapabilities(eventType);
  }

  return configured;
}

export async function eventHasCapability(eventId: string, capability: string) {
  const capabilities = await getEventCapabilities(eventId);
  return capabilities.includes(capability as EventCapability);
}
