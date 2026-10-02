import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { db } from "@/lib/db";
import { eventHasCapability } from "@/lib/event-capabilities";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/sessions";

export default async function GiftConfirmationsPage() {
  const session = await requireAdmin("/admin/presentes/confirmacoes");
  if (!(await eventHasCapability(session.event_id, "gifts"))) redirect("/admin");
  const sql = db();

  const reservations = await sql`
    SELECT
      r.id,
      r.created_at,
      g.name AS gift_name
    FROM reservations r
    JOIN gifts g ON g.id = r.gift_id AND g.event_id = r.event_id
    WHERE r.event_id = ${session.event_id}
      AND r.released_at IS NULL
      AND g.deleted_at IS NULL
    ORDER BY r.created_at DESC
  `;

  return (
    <main className="admin-page admin-management-page-v6">
      <Link href="/admin/presentes" className="setup-edit-back">
        <ArrowLeft size={15} />
        Voltar para presentes
      </Link>

      <AdminPageHeader
        eyebrow="Presentes"
        title="Confirmações de presentes"
        description="Consulte quais presentes já foram escolhidos para este evento."
      />

      <section className="admin-list-section-v6">
        <div className="admin-list-toolbar-v6">
          <strong>Escolhas confirmadas</strong>
          <span>
            {reservations.length} {reservations.length === 1 ? "confirmação" : "confirmações"}
          </span>
        </div>

        <div className="admin-gift-confirmations-v1">
          {reservations.map((reservation: any) => (
            <article className="admin-gift-confirmation-row-v1" key={reservation.id}>
              <span className="admin-gift-confirmation-row-v1__icon">
                <Gift size={17} />
              </span>
              <div className="admin-gift-confirmation-row-v1__copy">
                <strong>{reservation.gift_name}</strong>
                <span>Presente reservado</span>
              </div>
            </article>
          ))}

          {!reservations.length && (
            <div className="empty-state compact">
              <p>Nenhum presente foi confirmado ainda.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
