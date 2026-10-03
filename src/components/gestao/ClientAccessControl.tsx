"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClientAccessControl({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(`/api/gestao/events/${eventId}/client-access`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.message || "Não foi possível criar o acesso.");
        return;
      }

      setMessage("Acesso criado.");
      setPassword("");
      router.refresh();
    } catch {
      setMessage("Não foi possível criar o acesso agora.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <label>
        <span>Nome do responsável</span>
        <input
          value={name}
          onChange={event => setName(event.target.value)}
          minLength={2}
          maxLength={120}
          required
        />
      </label>

      <label>
        <span>E-mail de acesso</span>
        <input
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          maxLength={200}
          required
        />
      </label>

      <label>
        <span>Senha inicial</span>
        <input
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          minLength={12}
          maxLength={200}
          autoComplete="new-password"
          required
        />
        <small>Use pelo menos 12 caracteres. A senha não fica visível depois da criação.</small>
      </label>

      <button className="gestao-primary-action" type="submit" disabled={busy}>
        {busy ? "Criando acesso..." : "Criar acesso do cliente"}
      </button>

      {message && <p className="muted" role="status">{message}</p>}
    </form>
  );
}
