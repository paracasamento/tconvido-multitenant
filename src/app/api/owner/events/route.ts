import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, sameOriginStrict } from "@/lib/security";
import { getPlatformSession, selectOwnerEvent } from "@/lib/sessions";
import { defaultInviteVisualConfig } from "@/lib/invite-builder";

const schema = z.object({
  couple_names: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(160).optional().default(""),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  event_time: z.string().regex(/^\d{2}:\d{2}$/),
  venue: z.string().trim().min(2).max(180),
  city: z.string().trim().min(2).max(180),
  owner_name: z.string().trim().min(2).max(120),
  owner_email: z.string().trim().email().max(200),
  owner_password: z.string().min(12).max(200),
});

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export async function POST(request: Request) {
  if (!sameOriginStrict(request)) {
    return NextResponse.json({ message: "Origem inválida." }, { status: 403 });
  }

  const platform = await getPlatformSession();
  if (!platform) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Confira os dados do evento." }, { status: 400 });
  }

  const value = parsed.data;
  const slug = slugify(value.slug || value.couple_names);
  if (!slug) {
    return NextResponse.json({ message: "Não foi possível gerar o link do evento." }, { status: 400 });
  }

  const sql = db();
  const existing = await sql`
    SELECT
      EXISTS(SELECT 1 FROM events WHERE slug = ${slug}) AS slug_exists,
      EXISTS(SELECT 1 FROM admins WHERE lower(email) = lower(${value.owner_email})) AS email_exists
  `;
  if (existing[0]?.slug_exists) {
    return NextResponse.json({ message: "Esse slug já está em uso. Escolha outro." }, { status: 409 });
  }
  if (existing[0]?.email_exists) {
    return NextResponse.json({ message: "Esse e-mail já possui uma conta. Cada dono deve ter um acesso exclusivo para um evento." }, { status: 409 });
  }

  const eventId = crypto.randomUUID();
  const adminId = crypto.randomUUID();
  const passwordHash = await hashPassword(value.owner_password);
  const initialConfig = structuredClone(defaultInviteVisualConfig);
  const coverNames = initialConfig.screens.cover.elements.find(element => element.id === "cover-names");
  if (coverNames) coverNames.text = value.couple_names.toUpperCase();
  const coverTitle = initialConfig.screens.cover.elements.find(element => element.id === "cover-title");
  if (coverTitle) coverTitle.text = value.title;
  const serializedConfig = JSON.stringify(initialConfig);

  await sql`
    WITH new_event AS (
      INSERT INTO events (
        id, slug, title, couple_names, public_intro, message,
        event_date, event_time, venue, city, status
      )
      VALUES (
        ${eventId}, ${slug}, ${value.title}, ${value.couple_names}, '',
        NULL, ${value.event_date}::date, ${value.event_time}::time,
        ${value.venue}, ${value.city}, 'draft'
      )
    ),
    new_admin AS (
      INSERT INTO admins (id, name, email, password_hash, is_active)
      VALUES (${adminId}, ${value.owner_name}, ${value.owner_email.toLowerCase()}, ${passwordHash}, true)
    ),
    owner_link AS (
      INSERT INTO event_admins (event_id, admin_id, role)
      VALUES (${eventId}, ${adminId}, 'owner')
    ),
    initial_design AS (
      INSERT INTO invite_visual_designs (event_id, config, updated_at)
      VALUES (${eventId}, ${serializedConfig}::jsonb, now())
    )
    INSERT INTO audit_logs (
      event_id, admin_id, action, entity_type, entity_id, metadata
    )
    VALUES (
      ${eventId}, ${platform.admin_id}, 'event_created', 'event', ${eventId},
      ${JSON.stringify({ owner_admin_id: adminId, owner_email: value.owner_email.toLowerCase() })}::jsonb
    )
  `;

  await selectOwnerEvent(eventId);

  return NextResponse.json({ ok: true, event_id: eventId, slug });
}
