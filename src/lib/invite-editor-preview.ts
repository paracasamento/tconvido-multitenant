import { db } from "@/lib/db";
import { buildEventTemplateVars } from "@/lib/event";
import { giftImageUrl } from "@/lib/storage";
import type { GiftUi } from "@/components/GiftCard";

export type InviteEditorPreviewData = {
  vars: Record<string, string>;
  gifts: GiftUi[];
  giftColorPreferences: Array<{ name: string; hex: string }>;
};

export async function getInviteEditorPreviewData(eventId: string): Promise<InviteEditorPreviewData> {
  const sql = db();

  const [eventRows, guestRows, giftRows] = await Promise.all([
    sql`
      SELECT
        id,
        title,
        couple_names,
        public_intro,
        to_char(event_date, 'YYYY-MM-DD') AS event_date,
        to_char(event_time, 'HH24:MI') AS event_time,
        venue,
        city,
        maps_url,
        COALESCE(gift_color_preferences, '[]'::jsonb) AS gift_color_preferences
      FROM events
      WHERE id = ${eventId}
      LIMIT 1
    `,
    sql`
      SELECT name
      FROM guests
      WHERE event_id = ${eventId}
        AND deleted_at IS NULL
      ORDER BY created_at ASC
      LIMIT 1
    `,
    sql`
      SELECT
        g.id,
        g.name,
        g.description,
        g.image_path,
        CASE
          WHEN (
            SELECT COUNT(*)
            FROM reservations r
            WHERE r.gift_id = g.id
              AND r.event_id = g.event_id
              AND r.released_at IS NULL
          ) >= g.available_quantity THEN 'reserved'
          ELSE 'available'
        END AS status
      FROM gifts g
      WHERE g.event_id = ${eventId}
        AND g.deleted_at IS NULL
        AND g.is_active = true
      ORDER BY g.sort_order, g.created_at
      LIMIT 8
    `,
  ]);

  const event = eventRows[0] as any;

  if (!event) {
    return {
      vars: {
        couple_names: "",
        title: "",
        date: "",
        time: "",
        venue: "",
        city: "",
        city_suffix: "",
        maps_url: "#",
        weekday: "",
        day: "",
        month: "",
        year: "",
        event_datetime: "2026-11-22T16:00:00-03:00",
        guest_name: "Convidado",
      },
      gifts: [],
      giftColorPreferences: [],
    };
  }

  const eventDate = String(event.event_date || "");
  const eventTime = String(event.event_time || "");

  const giftColorPreferences = Array.isArray(event.gift_color_preferences)
    ? event.gift_color_preferences
        .filter((item: any) => item && /^#[0-9a-fA-F]{6}$/.test(String(item.hex || "")))
        .map((item: any) => ({
          name: typeof item.name === "string" ? item.name : "",
          hex: String(item.hex).toUpperCase(),
        }))
    : [];

  const gifts: GiftUi[] = giftRows.map((row: any) => ({
    id: String(row.id),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    image_url: giftImageUrl(row.image_path),
    status: row.status === "reserved" ? "reserved" : "available",
    colors: giftColorPreferences,
  }));

  return {
    vars: buildEventTemplateVars(
      {
        title: String(event.title || ""),
        couple_names: String(event.couple_names || ""),
        public_intro: String(event.public_intro || ""),
        event_date: eventDate,
        event_time: eventTime,
        venue: String(event.venue || ""),
        city: String(event.city || ""),
        maps_url: event.maps_url ? String(event.maps_url) : null,
      },
      {
        guest_name: guestRows[0]?.name ? String(guestRows[0].name) : "Convidado",
      }
    ),
    gifts,
    giftColorPreferences,
  };
}
