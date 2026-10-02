import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateEventForm } from "@/components/gestao/CreateEventForm";
import { requirePlatformAdmin } from "@/lib/sessions";

export default async function NewEventPage() {
  await requirePlatformAdmin("/gestao/eventos/novo");

  return (
    <main className="gestao-home">
      <Link href="/gestao/eventos" className="gestao-back-link"><ArrowLeft size={15} /> Voltar para eventos</Link>
      <section className="gestao-hero">
        <p className="gestao-kicker">Novo convite</p>
        <h1>Criar evento</h1>
        <p>Crie um rascunho de produção. O acesso do cliente só será criado quando o convite estiver pronto para entrega.</p>
      </section>
      <CreateEventForm />
    </main>
  );
}
