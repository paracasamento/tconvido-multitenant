"use client";

import { FileSpreadsheet } from "lucide-react";
import type { RefObject } from "react";

export function GuestSheetForm({
  fileRef,
  fileName,
  names,
  busy,
  allowedAdults,
  allowedChildren,
  onAdultsChange,
  onChildrenChange,
  onFile
}: {
  fileRef: RefObject<HTMLInputElement | null>;
  fileName: string;
  names: string[];
  busy: boolean;
  allowedAdults: number;
  allowedChildren: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  onFile: (file: File | null) => void;
}) {
  return (
    <>
      <label className="sheet-drop">
        <FileSpreadsheet size={28} />
        <strong>{fileName || "Selecionar planilha"}</strong>
        <span>Excel (.xlsx/.xls) ou CSV · coluna “Nome” ou primeira coluna</span>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={event => onFile(event.target.files?.[0] || null)}
        />
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
      <p className="muted">Os limites escolhidos serão aplicados a todos os nomes da planilha e podem ser ajustados individualmente depois.</p>

      {!!names.length && (
        <div className="sheet-preview">
          <div><strong>{names.length}</strong> nomes encontrados</div>
          <p>{names.slice(0, 6).join(" · ")}{names.length > 6 ? " · …" : ""}</p>
        </div>
      )}
      <button className="button button--primary" disabled={busy || !names.length}>{busy ? "Importando..." : `Importar ${names.length || ""} convidados`}</button>
    </>
  );
}
