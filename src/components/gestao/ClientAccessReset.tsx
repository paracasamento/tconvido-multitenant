"use client";

import { useState } from "react";

export function ClientAccessReset({ eventId }: { eventId: string }) {
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
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.message || "Não foi possível redefinir a senha.");
        return;
      }

      setPassword("");
      setMessage("Senha redefinida. As sessões anteriores do cliente foram encerradas.");
    } catch {
      setMessage("Não foi possível redefinir a senha agora.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 10, marginTop: 14 }}>
      <label>
        <span>Nova senha do cliente</span>
        <input
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          minLength={12}
          maxLength={200}
          autoComplete="new-password"
          placeholder="Mínimo de 12 caracteres"
          required
        />
      </label>
      <button className="button button--soft button--small" type="submit" disabled={busy}>
        {busy ? "Redefinindo..." : "Redefinir senha"}
      </button>
      {message && <small className="muted" role="status">{message}</small>}
    </form>
  );
}
