import Link from "next/link";
import { CalendarDays, MessageCircle, Clock3, CircleAlert } from "lucide-react";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/sessions";
import { EVENT_TYPE_DEFINITIONS, type EventType } from "@/lib/event-types";

export const dynamic = "force-dynamic";

function priority(date: string | null, defined: boolean) {
  if (!defined || !date) return { label: "Sem data", cls: "is-undated", days: null };
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(date + "T12:00:00");
  const days = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  if (days <= 30) return { label: "Prioridade alta", cls: "is-high", days };
  if (days <= 90) return { label: "Atenção", cls: "is-medium", days };
  return { label: "Programado", cls: "is-normal", days };
}

function whatsappUrl(phone: string, name: string) {
  const digits = phone.replace(/\D/g, "");
  const number = digits.startsWith("55") ? digits : "55" + digits;
  return "https://wa.me/" + number + "?text=" + encodeURIComponent("Olá, " + name + "! Aqui é da TConvido. Recebi a ficha do seu convite e estou entrando em contato para conversarmos sobre ele.");
}

export default async function FichasPage() {
  await requirePlatformAdmin("/gestao/fichas");
  const sql = db();
  const rows = await sql`
    SELECT id, event_type, status, contact_name, whatsapp, event_date_defined,
      event_date::text AS event_date, answers, pending_items, submitted_at
    FROM invitation_intakes
    WHERE status <> 'draft'
    ORDER BY
      CASE WHEN event_date_defined AND event_date IS NOT NULL THEN 0 ELSE 1 END,
      event_date ASC NULLS LAST,
      submitted_at DESC
  `;

  return <main className="gestao-home">
    <section className="gestao-hero gestao-hero--events">
      <div><p className="gestao-kicker">Captação</p><h1>Fichas recebidas</h1><p>Solicitações públicas ordenadas pela proximidade do evento. Fichas sem data ficam destacadas separadamente.</p></div>
      <Link href="/" target="_blank" className="gestao-primary-action">Abrir ficha pública</Link>
    </section>

    <section className="intake-admin-summary">
      <div><strong>{rows.length}</strong><span>recebidas</span></div>
      <div><strong>{rows.filter((r:any)=>!r.event_date_defined).length}</strong><span>sem data</span></div>
      <div><strong>{rows.filter((r:any)=>r.status==="new").length}</strong><span>novas</span></div>
    </section>

    <section className="gestao-event-list">
      {rows.map((row:any) => {
        const p = priority(row.event_date, row.event_date_defined);
        const type = EVENT_TYPE_DEFINITIONS[row.event_type as EventType];
        const identity = row.answers?.identity || row.contact_name;
        return <article className="gestao-event-card intake-admin-card" key={row.id}>
          <div className="gestao-event-card__main">
            <div className="gestao-event-card__title">
              <div className="intake-admin-badges"><span className={"intake-priority " + p.cls}>{p.label}</span><span className="intake-type-badge">{type?.label || "Evento"}</span></div>
              <h2>{identity}</h2><p>Contato: {row.contact_name}</p>
            </div>
            <div className="gestao-event-card__meta">
              <span><CalendarDays size={14}/>{row.event_date_defined && row.event_date ? new Date(row.event_date+"T12:00:00").toLocaleDateString("pt-BR") : "Data ainda não definida"}</span>
              {p.days !== null && <span><Clock3 size={14}/>{p.days < 0 ? "Evento já passou" : p.days === 0 ? "Evento hoje" : p.days + " dias até o evento"}</span>}
              {Array.isArray(row.pending_items) && row.pending_items.length > 0 && <span><CircleAlert size={14}/>{row.pending_items.length} pendência(s)</span>}
            </div>
          </div>
          <div className="gestao-event-card__actions">
            <Link href={"/gestao/fichas/"+row.id}>Ver ficha</Link>
            <a href={whatsappUrl(row.whatsapp,row.contact_name)} target="_blank" rel="noreferrer"><MessageCircle size={16}/> WhatsApp</a>
          </div>
        </article>
      })}
      {!rows.length && <div className="gestao-empty-events"><strong>Nenhuma ficha recebida ainda.</strong><p>Quando alguém enviar a ficha pública, ela aparecerá aqui.</p></div>}
    </section>
  </main>;
}
