import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/sessions";
import { EVENT_TYPE_DEFINITIONS, type EventType } from "@/lib/event-types";
import { IntakeStatusControl } from "@/components/gestao/IntakeStatusControl";

export const dynamic = "force-dynamic";

export default async function FichaDetailPage({params}:{params:Promise<{id:string}>}) {
  await requirePlatformAdmin("/gestao/fichas");
  const {id}=await params; const sql=db();
  const rows=await sql`SELECT * FROM invitation_intakes WHERE id=${id} LIMIT 1`;
  const row:any=rows[0]; if(!row) notFound();
  const type=EVENT_TYPE_DEFINITIONS[row.event_type as EventType];
  const a=row.answers || {}; const v=row.visual_direction || {};
  const digits=String(row.whatsapp||"").replace(/\D/g,""); const wa=digits.startsWith("55")?digits:"55"+digits;
  return <main className="gestao-home">
    <Link href="/gestao/fichas" className="text-link">← Voltar às fichas</Link>
    <section className="gestao-hero gestao-hero--events"><div><p className="gestao-kicker">{type?.label}</p><h1>{a.identity || row.contact_name}</h1><p>Ficha enviada por {row.contact_name}.</p></div><a className="gestao-primary-action" target="_blank" rel="noreferrer" href={"https://wa.me/"+wa}><MessageCircle size={16}/> WhatsApp</a></section>
    <IntakeStatusControl id={row.id} initialStatus={row.status} />
    <div className="intake-detail-grid">
      <section className="settings-card"><h2>Evento</h2><dl className="intake-detail-list"><div><dt>Data</dt><dd>{row.event_date_defined && row.event_date ? new Date(row.event_date).toLocaleDateString("pt-BR",{timeZone:"UTC"}) : "Ainda não definida"}</dd></div><div><dt>Horário</dt><dd>{row.event_time ? String(row.event_time).slice(0,5) : "A definir"}</dd></div><div><dt>Local</dt><dd>{a.location_defined ? [a.venue,a.address,a.city].filter(Boolean).join(" · ") || "Informações incompletas" : "Ainda não definido"}</dd></div></dl></section>
      <section className="settings-card"><h2>Recursos desejados</h2><div className="intake-feature-list">{[["RSVP",a.rsvp_wanted],["Presentes",a.gifts_wanted],["Traje",a.dress_code_wanted],["Programação",a.schedule_wanted]].map(([label,on])=><span key={String(label)} className={on?"is-on":""}>{on?"✓":"—"} {label}</span>)}</div></section>
      <section className="settings-card"><h2>Estilo e referências</h2><dl className="intake-detail-list"><div><dt>Decoração</dt><dd>{v.decoration_status==="defined"?"Definida":v.decoration_status==="partial"?"Parcialmente definida":"Ainda não definida"}</dd></div><div><dt>Estilos</dt><dd>{v.style_tags?.join(" · ") || "Não informado"}</dd></div><div><dt>Cores</dt><dd>{v.color_notes || "Não informado"}</dd></div><div><dt>Observações</dt><dd>{v.decoration_notes || v.style_notes || "Nenhuma"}</dd></div></dl></section>
      <section className="settings-card"><h2>Informações adicionais</h2><p>{a.important_info || "Nenhuma informação adicional."}</p><h3>Mensagem/frase</h3><p>{a.required_message || "Pode ficar por nossa conta."}</p></section>
      <section className="settings-card"><h2>Contato</h2><dl className="intake-detail-list"><div><dt>Nome</dt><dd>{row.contact_name}</dd></div><div><dt>WhatsApp</dt><dd>{row.whatsapp}</dd></div><div><dt>E-mail</dt><dd>{row.email || "Não informado"}</dd></div></dl></section>
    </div>
  </main>;
}
