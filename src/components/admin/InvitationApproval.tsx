"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InvitationApproval({ status }: { status: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function send(action: "approve" | "request_changes") {
    setBusy(true);
    setMessage("");

    const response = await fetch("/api/admin/approval", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    const data = await response.json().catch(() => ({}));

    setBusy(false);
    if (!response.ok) {
      setMessage(data.message || "Não foi possível registrar.");
      return;
    }

    setNote("");
    setMessage(
      action === "approve"
        ? "Convite aprovado."
        : "Pedido de alteração enviado."
    );
    router.refresh();
  }

  if (status === "approved") {
    return (
      <section className="invitation-status-v6">
        <div>
          <strong>Convite aprovado</strong>
          <span>A Gestão já recebeu sua aprovação.</span>
        </div>
      </section>
    );
  }

  if (status === "delivered") {
    return (
      <section className="invitation-status-v6">
        <div>
          <strong>Convite entregue</strong>
          <span>A etapa de aprovação foi concluída.</span>
        </div>
      </section>
    );
  }

  if (status !== "review") {
    return (
      <section className="invitation-status-v6">
        <div>
          <strong>Convite em produção</strong>
          <span>
            Quando a Gestão enviar o convite para revisão, os botões de aprovação aparecerão aqui.
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="invitation-settings-section-v6">
      <div className="admin-list-toolbar-v6">
        <strong>Aprovação do convite</strong>
      </div>

      <div className="invitation-status-v6">
        <div>
          <strong>Revise a prévia antes de aprovar</strong>
          <span>O cliente administra o evento; ajustes visuais são feitos pela Gestão.</span>
        </div>
      </div>

      <label>
        <span>Pedido de alteração</span>
        <textarea
          value={note}
          onChange={event => setNote(event.target.value)}
          placeholder="Descreva exatamente o que gostaria de ajustar."
        />
      </label>

      <div className="gestao-create-actions">
        <button
          type="button"
          onClick={() => send("request_changes")}
          disabled={busy}
        >
          Solicitar alteração
        </button>
        <button
          type="button"
          className="gestao-primary-action"
          onClick={() => send("approve")}
          disabled={busy}
        >
          Aprovar convite
        </button>
      </div>

      {message && <p>{message}</p>}
    </section>
  );
}
