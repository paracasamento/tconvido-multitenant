import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateEventForm } from "@/components/gestao/CreateEventForm";
import { requirePlatformAdmin } from "@/lib/sessions";

export default async function NewEventPage() {
  await requirePlatformAdmin("/gestao/eventos/novo");

  return (
    <main className="gestao-home">
      <Link href="/gestao" className="gestao-back-link"><ArrowLeft size={15} /> Voltar para eventos</Link>
      <section className="gestao-hero">
        <p className="gestao-kicker">Novo convite</p>
        <h1>Criar evento</h1>
        <p>O evento nasce em rascunho e já recebe uma conta exclusiva para o dono.</p>
      </section>
      <CreateEventForm />
    </main>
  );
}
