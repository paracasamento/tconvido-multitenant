import Link from "next/link";
import { CalendarDays, ExternalLink, LayoutDashboard, Palette, Plus, UserRound } from "lucide-react";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/sessions";

export const dynamic = "force-dynamic";

export default async function GestaoHomePage() {
  const session = await requirePlatformAdmin("/gestao");
  const sql = db();

  const events = await sql`
    SELECT
      e.id,
      e.slug,
      e.title,
      e.couple_names,
      e.status,
      to_char(e.event_date, 'DD/MM/YYYY') AS event_date,
      owner_admin.name AS owner_name,
      owner_admin.email AS owner_email
    FROM events e
    LEFT JOIN LATERAL (
      SELECT a.name, a.email
      FROM event_admins ea
      JOIN admins a ON a.id = ea.admin_id
      WHERE ea.event_id = e.id
        AND ea.role = 'owner'
      ORDER BY ea.created_at ASC
      LIMIT 1
    ) owner_admin ON true
    ORDER BY e.created_at DESC
  `;

  return (
    <main className="gestao-home">
      <section className="gestao-hero gestao-hero--events">
        <div>
          <p className="gestao-kicker">Área de gestão</p>
          <h1>Eventos</h1>
          <p>Olá, {session.admin_name}. Crie convites, acesse o painel dos clientes e edite cada evento sem misturar os dados.</p>
        </div>
        <Link href="/gestao/eventos/novo" className="gestao-primary-action">
          <Plus size={17} />
          Novo evento
        </Link>
      </section>

      <section className="gestao-event-list" aria-label="Eventos cadastrados">
        {events.map((event: any) => (
          <article className="gestao-event-card" key={event.id}>
            <div className="gestao-event-card__main">
              <div className="gestao-event-card__title">
                <span className={`gestao-event-status is-${event.status}`}>
                  {event.status === "active" ? "Ativo" : event.status === "closed" ? "Pausado" : "Rascunho"}
                </span>
                <h2>{event.couple_names}</h2>
                <p>{event.title}</p>
              </div>
              <div className="gestao-event-card__meta">
                <span><CalendarDays size={14} /> {event.event_date}</span>
                <span><UserRound size={14} /> {event.owner_name || "Sem dono definido"}</span>
                <small>/e/{event.slug}</small>
              </div>
            </div>

            <div className="gestao-event-card__actions">
              <form action={`/api/owner/events/${event.id}/select?next=%2Fadmin`} method="post">
                <button type="submit"><LayoutDashboard size={16} /> Painel</button>
              </form>
              <form action={`/api/owner/events/${event.id}/select?next=%2Fgestao%2Feditor`} method="post">
                <button type="submit"><Palette size={16} /> Editor</button>
              </form>
              <Link href={`/e/${event.slug}`} target="_blank">
                <ExternalLink size={16} /> Convite
              </Link>
            </div>
          </article>
        ))}

        {!events.length && (
          <div className="gestao-empty-events">
            <strong>Nenhum evento criado ainda.</strong>
            <p>Crie o primeiro evento para começar a configurar o convite e o acesso do dono.</p>
            <Link href="/gestao/eventos/novo" className="gestao-primary-action"><Plus size={16} /> Criar evento</Link>
          </div>
        )}
      </section>
    </main>
  );
}
