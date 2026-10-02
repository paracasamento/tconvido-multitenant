import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ExternalLink, LayoutDashboard, Palette, UserRound, CircleAlert } from "lucide-react";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/sessions";
import { EVENT_TYPE_DEFINITIONS, type EventType } from "@/lib/event-types";

export const dynamic = "force-dynamic";

export default async function EventWorkspacePage({params}:{params:Promise<{id:string}>}) {
  await requirePlatformAdmin("/gestao");
  const {id}=await params; const sql=db();
  const rows=await sql`
    SELECT e.*, owner_admin.name AS owner_name, owner_admin.email AS owner_email,
      (SELECT count(*)::int FROM guests g WHERE g.event_id=e.id AND g.deleted_at IS NULL) AS guest_count,
      (SELECT count(*)::int FROM gifts g WHERE g.event_id=e.id AND g.deleted_at IS NULL) AS gift_count
    FROM events e
    LEFT JOIN LATERAL (
      SELECT a.name,a.email FROM event_admins ea JOIN admins a ON a.id=ea.admin_id
      WHERE ea.event_id=e.id AND ea.role='owner' ORDER BY ea.created_at ASC LIMIT 1
    ) owner_admin ON true
    WHERE e.id=${id} LIMIT 1
  `;
  const event:any=rows[0]; if(!event)notFound();
  const type=EVENT_TYPE_DEFINITIONS[event.event_type as EventType];
  const identity=event.event_name||event.couple_names||event.celebrant_name||event.baby_name||event.hosts_names||event.title;
  const caps=Array.isArray(event.enabled_capabilities)?event.enabled_capabilities:[];
  const pending:string[]=[];
  if(!event.event_date)pending.push("Data do evento");
  if(!event.event_time)pending.push("Horário");
  if(!event.venue&&!event.city)pending.push("Local");
  if(!event.owner_name)pending.push("Acesso do cliente");

  return <main className="gestao-home">
    <Link href="/gestao" className="gestao-back-link">← Voltar aos eventos</Link>
    <section className="gestao-hero gestao-hero--events">
      <div><p className="gestao-kicker">{type?.label||"Evento"} · {event.production_status==="draft"?"Em preparação":event.production_status}</p><h1>{identity}</h1><p>Central de produção deste convite. Aqui a Gestão acompanha dados, pendências e acessa as ferramentas do evento.</p></div>
      <Link href={"/e/"+event.slug} target="_blank" className="gestao-primary-action"><ExternalLink size={16}/> Ver convite</Link>
    </section>

    <section className="intake-admin-summary">
      <div><strong>{event.guest_count||0}</strong><span>convidados</span></div>
      <div><strong>{event.gift_count||0}</strong><span>presentes</span></div>
      <div><strong>{pending.length}</strong><span>pendências</span></div>
    </section>

    <div className="intake-detail-grid">
      <section className="settings-card"><h2>Produção</h2><dl className="intake-detail-list">
        <div><dt>Data</dt><dd>{event.event_date?new Date(event.event_date).toLocaleDateString("pt-BR",{timeZone:"UTC"}):"A definir"}</dd></div>
        <div><dt>Horário</dt><dd>{event.event_time?String(event.event_time).slice(0,5):"A definir"}</dd></div>
        <div><dt>Local</dt><dd>{[event.venue,event.city].filter(Boolean).join(" · ")||"A definir"}</dd></div>
        <div><dt>Prazo de entrega</dt><dd>{event.delivery_deadline?new Date(event.delivery_deadline).toLocaleDateString("pt-BR"):"Não definido"}</dd></div>
      </dl></section>

      <section className="settings-card"><h2>Cliente</h2><dl className="intake-detail-list">
        <div><dt>Responsável</dt><dd>{event.owner_name||"Conta ainda não criada"}</dd></div>
        <div><dt>E-mail</dt><dd>{event.owner_email||"—"}</dd></div>
        <div><dt>URL pública</dt><dd>/e/{event.slug}</dd></div>
      </dl></section>

      <section className="settings-card"><h2>Recursos do convite</h2><div className="intake-feature-list">
        {["rsvp","gifts","dress_code","schedule"].map(cap=><span key={cap} className={caps.includes(cap)?"is-on":""}>{caps.includes(cap)?"✓":"—"} {cap==="rsvp"?"RSVP":cap==="gifts"?"Presentes":cap==="dress_code"?"Traje":"Programação"}</span>)}
      </div></section>

      <section className="settings-card"><h2>Pendências</h2>{pending.length?<div className="intake-feature-list">{pending.map(item=><span key={item}><CircleAlert size={14}/> {item}</span>)}</div>:<p>Nenhuma pendência estrutural básica.</p>}</section>
    </div>

    <section className="settings-card"><h2>Ferramentas do evento</h2><div className="card-actions">
      <form action={`/api/owner/events/${event.id}/select?next=%2Fgestao%2Feditor`} method="post"><button className="gestao-primary-action" type="submit"><Palette size={16}/> Editar convite</button></form>
      <form action={`/api/owner/events/${event.id}/select?next=%2Fadmin`} method="post"><button className="gestao-primary-action" type="submit"><LayoutDashboard size={16}/> Abrir painel do cliente</button></form>
    </div></section>
  </main>;
}
