import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { intakeSchema, buildIntakePendingItems } from "@/lib/intake";

export async function POST(request: Request) {
  const parsed = intakeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Confira os dados da ficha." }, { status: 400 });
  }

  const value = parsed.data;
  const id = crypto.randomUUID();
  const publicToken = crypto.randomBytes(32).toString("base64url");
  const publicTokenHash = crypto.createHash("sha256").update(publicToken).digest("hex");
  const pending = buildIntakePendingItems(value);
  const answers = {
    identity: value.identity,
    age: value.age ?? null,
    location_defined: value.location_defined,
    venue: value.venue,
    address: value.address,
    city: value.city,
    maps_url: value.maps_url,
    rsvp_wanted: value.rsvp_wanted,
    gifts_wanted: value.gifts_wanted,
    dress_code_wanted: value.dress_code_wanted,
    schedule_wanted: value.schedule_wanted,
    important_info: value.important_info,
    required_message: value.required_message,
  };
  const visualDirection = {
    decoration_status: value.decoration_status,
    decoration_notes: value.decoration_notes,
    style_tags: value.style_tags,
    color_notes: value.color_notes,
    style_notes: value.style_notes,
  };

  const sql = db();
  await sql`
    INSERT INTO invitation_intakes (
      id, public_token_hash, source, event_type, status, contact_name, whatsapp, email,
      event_date, event_date_defined, event_time, answers, visual_direction, pending_items, submitted_at
    ) VALUES (
      ${id}, ${publicTokenHash}, 'public', ${value.event_type}, 'new', ${value.contact_name},
      ${value.whatsapp}, ${value.email || null}, ${value.event_date || null}::date,
      ${value.event_date_defined}, ${value.event_time || null}::time,
      ${JSON.stringify(answers)}::jsonb, ${JSON.stringify(visualDirection)}::jsonb,
      ${JSON.stringify(pending)}::jsonb, now()
    )
  `;

  return NextResponse.json({ ok: true, intake_id: id, access_token: publicToken });
}
