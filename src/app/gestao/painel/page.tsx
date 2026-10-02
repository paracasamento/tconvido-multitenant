import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/sessions";

export default async function GestaoPainelPage() {
  await requireOwner("/gestao/painel");
  redirect("/admin");
}
