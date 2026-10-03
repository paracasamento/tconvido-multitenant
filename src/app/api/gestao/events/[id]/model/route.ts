import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminLog } from "@/lib/admin-log";
import { createInvitationModelConfig, getInvitationModel } from "@/lib/invitation-models";
import { isEventType } from "@/lib/event-types";
import { sameOriginStrict } from "@/lib/security";
import { getPlatformSession } from "@/lib/sessions";

const schema = z.object({
  model_id: z.string().trim().min(1).max(120),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!sameOriginStrict(request)) {
    return NextResponse.json({ message: "Origem inválida." }, { status: 403 });
  }

  const platform = await getPlatformSession();
  if (!platform) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Modelo inválido." }, { status: 400 });
  }

  const model = getInvitationModel(parsed.data.model_id);
  if (!model) {
    return NextResponse.json({ message: "Modelo não encontrado." }, { status: 404 });
  }

  const { id: eventId } = await context.params;
  const sql = db();
  const rows = await sql`
    SELECT event_type
    FROM events
    WHERE id = ${eventId}
    LIMIT 1
  `;

  if (!rows.length) {
    return NextResponse.json({ message: "Evento não encontrado." }, { status: 404 });
  }

  const eventType = String(rows[0].event_type || "");
  if (!isEventType(eventType) || !model.eventTypes.includes(eventType)) {
    return NextResponse.json(
      { message: "Este modelo não é compatível com o tipo deste evento." },
      { status: 409 }
    );
  }

  const config = createInvitationModelConfig(model.id, eventType);
  const serialized = JSON.stringify(config);

  await sql`
    INSERT INTO invite_visual_designs (event_id, config, updated_at)
    VALUES (${eventId}, ${serialized}::jsonb, now())
    ON CONFLICT (event_id)
    DO UPDATE SET
      config = EXCLUDED.config,
      updated_at = now()
  `;

  await adminLog({
    eventId,
    adminId: platform.admin_id,
    action: "invitation_model_applied",
    entityType: "event",
    entityId: eventId,
    metadata: {
      model_id: model.id,
      model_name: model.name,
      event_type: eventType,
    },
  });

  return NextResponse.json({ ok: true, model_id: model.id });
}
