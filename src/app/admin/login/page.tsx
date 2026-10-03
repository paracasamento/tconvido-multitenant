import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { FloralFrame } from "@/components/Florals";
import { Monogram } from "@/components/Monogram";
import { safeInternalPath } from "@/lib/access-routing";
import { getAdminSession } from "@/lib/sessions";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = safeInternalPath(params.next, "/admin", ["/admin"]);

  const session = await getAdminSession();
  if (session) redirect(next);

  return (
    <main className="center-page">
      <FloralFrame subtle />
      <section className="narrow-panel">
        <Monogram size={96} priority />
        <p className="eyebrow">Área do evento</p>
        <h1>Bem-vindo</h1>
        <p>Entre para acompanhar convidados e administrar as informações disponíveis para o seu evento.</p>
        <AdminLoginForm redirectTo={next} />
      </section>
    </main>
  );
}
