import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminLog } from "@/lib/admin-log";
import { getAdminSetupState } from "@/lib/admin-setup";
import { validateEventReadiness } from "@/lib/event-readiness";
import { getAdminSession } from "@/lib/sessions";
import { sameOrigin } from "@/lib/security";

const schema = z.object({ status: z.enum(["draft", "active", "closed"]) });

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Origem inválida." }, { status: 403 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Status inválido." }, { status: 400 });

  const sql = db();

  if (parsed.data.status === "active") {
    const setup = await getAdminSetupState(session.event_id);
    const eventRows = await sql`
      SELECT
        event_type,
        event_name,
        celebrant_name,
        baby_name,
        hosts_names,
        couple_names,
        title,
        event_date,
        event_time,
        venue,
        city,
        delivery_deadline,
        rsvp_deadline,
        gift_deadline,
        enabled_capabilities
      FROM events
      WHERE id = ${session.event_id}
      LIMIT 1
    `;
    const event = eventRows[0] as any;
    const requiredIssues = event
      ? validateEventReadiness(event).filter(issue => issue.severity === "required")
      : [{ key: "event", label: "Evento não encontrado.", severity: "required" as const }];

    if (!setup.coreReady || requiredIssues.length) {
      return NextResponse.json(
        {
          message: "Conclua as informações obrigatórias antes de publicar o convite.",
          missing: requiredIssues.map(issue => issue.label),
        },
        { status: 409 }
      );
    }
  }

  await sql`UPDATE events SET status = ${parsed.data.status}, updated_at = now() WHERE id = ${session.event_id}`;

  await adminLog({
    eventId: session.event_id,
    adminId: session.admin_id,
    action: "event_status_changed",
    entityType: "event",
    entityId: session.event_id,
    metadata: { status: parsed.data.status }
  });

  return NextResponse.json({ ok: true });
}
