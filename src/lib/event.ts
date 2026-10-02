import { db } from "@/lib/db";

export type EventRecord = {
  id: string;
  slug: string;
  title: string;
  couple_names: string;
  public_intro: string;
  message: string | null;
  event_date: string;
  event_time: string;
  venue: string;
  city: string;
  maps_url: string | null;
  gift_color_preferences: Array<{ name: string; hex: string }>;
  status: "draft" | "active" | "closed";
  event_type?: string;
  event_name?: string | null;
  celebrant_name?: string | null;
  baby_name?: string | null;
  hosts_names?: string | null;
  enabled_capabilities?: string[];
};

async function getEventByWhere(slug: string): Promise<EventRecord | null> {
  const sql = db();
  const rows = await sql`
    SELECT
      id,
      slug,
      title,
      couple_names,
      public_intro,
      message,
      to_char(event_date, 'YYYY-MM-DD') AS event_date,
      to_char(event_time, 'HH24:MI') AS event_time,
      venue,
      city,
      maps_url,
      COALESCE(gift_color_preferences, '[]'::jsonb) AS gift_color_preferences,
      status,
      event_type,
      event_name,
      celebrant_name,
      baby_name,
      hosts_names,
      COALESCE(enabled_capabilities,\'[]\'::jsonb) AS enabled_capabilities
    FROM events
    WHERE slug = ${slug}
    LIMIT 1
  `;
  return (rows[0] as EventRecord | undefined) ?? null;
}

export async function getEventBySlug(slug: string): Promise<EventRecord | null> {
  return getEventByWhere(slug);
}

export function displayDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, day)));
}


export function eventDateParts(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, Math.max(0, (month || 1) - 1), day || 1));
  const monthLong = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: "UTC",
  }).format(value);
  const monthShort = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    timeZone: "UTC",
  }).format(value).replace(/\.$/, "");
  const weekdayLong = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    timeZone: "UTC",
  }).format(value);
  const weekdayShort = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    timeZone: "UTC",
  }).format(value).replace(/\.$/, "");

  return {
    day: String(day || "").padStart(2, "0"),
    day_number: String(day || ""),
    month: monthLong,
    month_short: monthShort,
    weekday: weekdayLong,
    weekday_short: weekdayShort,
    year: year ? String(year) : "",
  };
}

export function compactEventTime(time: string) {
  return String(time || "").replace(/:00$/, "");
}

function eventInitials(coupleNames: string, title: string) {
  const source = String(coupleNames || title || "").trim();
  if (!source) return "";

  const parties = source
    .split(/\s*(?:&|\+|\/|\be\b)\s*/i)
    .map(value => value.trim())
    .filter(Boolean);

  if (parties.length >= 2) {
    return parties.slice(0, 2).map(value => value[0]?.toUpperCase() || "").join("");
  }

  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(value => value[0]?.toUpperCase() || "")
    .join("");
}

export function buildEventTemplateVars(
  event: Pick<
    EventRecord,
    "title" | "couple_names" | "public_intro" | "event_date" | "event_time" | "venue" | "city" | "maps_url" | "event_name" | "celebrant_name" | "baby_name" | "hosts_names"
  >,
  extras: Record<string, string | undefined> = {}
) {
  const parts = eventDateParts(event.event_date);
  const fallbackMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [event.venue, event.city].filter(Boolean).join(", ")
  )}`;

  return {
    couple_names: String(event.couple_names || ""),
    event_name: String(event.event_name || ""),
    celebrant_name: String(event.celebrant_name || ""),
    baby_name: String(event.baby_name || ""),
    hosts_names: String(event.hosts_names || ""),
    title: String(event.title || ""),
    intro: String(event.public_intro || ""),
    date: displayDate(event.event_date),
    time: compactEventTime(event.event_time),
    venue: String(event.venue || ""),
    city: String(event.city || ""),
    city_suffix: event.city ? `, ${String(event.city)}` : "",
    maps_url: String(event.maps_url || fallbackMapsUrl),
    weekday: parts.weekday,
    weekday_short: parts.weekday_short,
    day: parts.day,
    day_number: parts.day_number,
    month: parts.month,
    month_short: parts.month_short,
    year: parts.year,
    initials: eventInitials(event.couple_names, event.title),
    event_datetime: `${event.event_date}T${event.event_time}:00-03:00`,
    ...extras,
  };
}
