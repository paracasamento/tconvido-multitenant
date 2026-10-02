"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApplyInvitationModelButton({
  eventId,
  modelId,
  modelName,
}: {
  eventId: string;
  modelId: string;
  modelName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function apply() {
    if (busy) return;

    const confirmed = window.confirm(
      `Aplicar o modelo “${modelName}”? O design visual atual deste evento será substituído. Os dados do evento, convidados, RSVP e presentes não serão apagados.`
    );
    if (!confirmed) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(`/api/gestao/events/${eventId}/model`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model_id: modelId }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.message || "Não foi possível aplicar o modelo.");
        return;
      }

      setMessage("Modelo aplicado.");
      router.refresh();
    } catch {
      setMessage("Não foi possível aplicar o modelo agora.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <button
        type="button"
        className="button button--soft button--small"
        onClick={apply}
        disabled={busy}
      >
        {busy ? "Aplicando..." : "Aplicar neste evento"}
      </button>
      {message && <small className="muted" role="status">{message}</small>}
    </div>
  );
}
