"use client";

export function GuestBulkForm({
  value,
  count,
  busy,
  allowedAdults,
  allowedChildren,
  onChange,
  onAdultsChange,
  onChildrenChange,
}: {
  value: string;
  count: number;
  busy: boolean;
  allowedAdults: number;
  allowedChildren: number;
  onChange: (value: string) => void;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
}) {
  return (
    <>
      <label>
        <span>Cole os nomes separados por vírgula, ponto e vírgula ou uma pessoa por linha</span>
        <textarea rows={6} value={value} onChange={event => onChange(event.target.value)} placeholder={"Ana Souza\nJoão Silva\nMaria Oliveira\nCarlos Pereira"} />
      </label>
      <div className="form-grid">
        <label>
          <span>Adultos permitidos por convite</span>
          <input type="number" min={1} max={20} value={allowedAdults} onChange={event => onAdultsChange(Math.max(1, Number(event.target.value || 1)))} />
        </label>
        <label>
          <span>Crianças permitidas por convite</span>
          <input type="number" min={0} max={20} value={allowedChildren} onChange={event => onChildrenChange(Math.max(0, Number(event.target.value || 0)))} />
        </label>
      </div>
      <p className="muted">Esses limites serão aplicados a todos os nomes desta importação e podem ser ajustados individualmente depois.</p>
      <div className="import-preview-line"><strong>{count}</strong> {count === 1 ? "nome identificado" : "nomes identificados"}</div>
      <button className="button button--primary" disabled={busy || !count}>{busy ? "Adicionando..." : `Adicionar ${count || ""} convidados`}</button>
    </>
  );
}
