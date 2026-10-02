"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { readJsonResponse } from "@/lib/client-response";

export function CreateEventForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/owner/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await readJsonResponse<{ message?: string }>(response);
      if (!response.ok) {
        setMessage(data.message || "Não foi possível criar o evento.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setMessage("Não foi possível falar com o servidor.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="gestao-create-form" onSubmit={submit}>
      <section className="gestao-form-section">
        <div className="gestao-form-section__heading">
          <span>01</span>
          <div><strong>Dados do evento</strong><small>Informações principais do convite.</small></div>
        </div>
        <div className="gestao-create-grid">
        <label>
          <span>Nome do casal ou evento</span>
          <input name="couple_names" required minLength={2} maxLength={120} placeholder="Ana & João" />
        </label>
        <label>
          <span>Título do convite</span>
          <input name="title" required minLength={2} maxLength={120} placeholder="Nosso casamento" />
        </label>
        <label>
          <span>Slug do link</span>
          <input name="slug" maxLength={160} placeholder="ana-e-joao" />
          <small>Se deixar vazio, o sistema gera automaticamente.</small>
        </label>
        <label>
          <span>Data</span>
          <input name="event_date" type="date" required />
        </label>
        <label>
          <span>Horário</span>
          <input name="event_time" type="time" required />
        </label>
        <label>
          <span>Local</span>
          <input name="venue" required minLength={2} maxLength={180} />
        </label>
        <label>
          <span>Cidade</span>
          <input name="city" required minLength={2} maxLength={180} />
        </label>
        <label>
          <span>Link da localização</span>
          <input name="maps_url" type="url" maxLength={1200} placeholder="https://maps.google.com/..." />
          <small>Opcional. Se ficar vazio, o convite usa Local + Cidade para abrir o mapa.</small>
        </label>
        </div>
      </section>

      <section className="gestao-create-owner gestao-form-section">
        <div className="gestao-form-section__heading">
          <span>02</span>
          <div><strong>Acesso do dono</strong><small>Conta exclusiva para administrar este evento.</small></div>
        </div>
        <div className="gestao-create-grid">
          <label>
            <span>Nome do responsável</span>
            <input name="owner_name" required minLength={2} maxLength={120} />
          </label>
          <label>
            <span>E-mail de acesso</span>
            <input name="owner_email" type="email" required maxLength={200} />
          </label>
          <label className="is-wide">
            <span>Senha inicial</span>
            <input name="owner_password" type="password" required minLength={12} maxLength={200} autoComplete="new-password" />
            <small>Mínimo de 12 caracteres.</small>
          </label>
        </div>
      </section>

      {message && <p className="form-error">{message}</p>}

      <div className="gestao-create-actions">
        <button type="button" onClick={() => router.push("/gestao")} className="gestao-secondary-action" disabled={busy}>Cancelar</button>
        <button type="submit" className="gestao-primary-action" disabled={busy}>{busy ? "Criando..." : "Criar evento e acesso"}</button>
      </div>
    </form>
  );
}
