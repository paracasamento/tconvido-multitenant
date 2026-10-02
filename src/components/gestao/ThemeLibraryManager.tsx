"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, PackagePlus, Save, Trash2, Upload, X } from "lucide-react";
import {
  THEME_SLOT_DEFINITIONS,
  type ThemeLibraryItem,
  type ThemeUploadSlot,
} from "@/lib/theme-library";

type KitDraft = {
  name: string;
  category: string;
  description: string;
  tags: string;
  palette: string;
  isActive: boolean;
};

function draftFromKit(kit: ThemeLibraryItem): KitDraft {
  return {
    name: kit.name,
    category: kit.category,
    description: kit.description || "",
    tags: kit.tags.join(", "),
    palette: kit.palette.join(", "),
    isActive: kit.isActive,
  };
}

function slotAsset(kit: ThemeLibraryItem, slot: ThemeUploadSlot) {
  if (slot === "background") return kit.backgrounds[0] || null;
  return kit.assets.find(asset => asset.slot === slot) || null;
}

export function ThemeLibraryManager({ kits }: { kits: ThemeLibraryItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [drafts, setDrafts] = useState<Record<string, KitDraft>>(
    Object.fromEntries(kits.map(kit => [kit.id, draftFromKit(kit)]))
  );

  async function createKit(form: HTMLFormElement) {
    setBusy("create");
    setMessage("");
    const fd = new FormData(form);
    const response = await fetch("/api/owner/theme-kits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        category: fd.get("category"),
        description: fd.get("description"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy("");
    if (!response.ok) {
      setMessage(data.message || "Não foi possível criar o kit.");
      return;
    }
    form.reset();
    router.refresh();
  }

  async function saveKit(kit: ThemeLibraryItem) {
    const draft = drafts[kit.id] || draftFromKit(kit);
    setBusy(`save:${kit.id}`);
    setMessage("");
    const response = await fetch(`/api/owner/theme-kits/${kit.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: draft.name,
        category: draft.category,
        description: draft.description,
        tags: draft.tags.split(",").map(value => value.trim()).filter(Boolean),
        palette: draft.palette.split(",").map(value => value.trim()).filter(Boolean),
        isActive: draft.isActive,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy("");
    if (!response.ok) {
      setMessage(data.message || "Não foi possível salvar o kit.");
      return;
    }
    setMessage("Kit salvo.");
    router.refresh();
  }

  async function uploadSlot(kitId: string, slot: ThemeUploadSlot, file: File | null) {
    if (!file) return;
    setBusy(`asset:${kitId}:${slot}`);
    setMessage("");
    const form = new FormData();
    form.set("slot", slot);
    form.set("image", file);
    const response = await fetch(`/api/owner/theme-kits/${kitId}/assets`, {
      method: "POST",
      body: form,
    });
    const data = await response.json().catch(() => ({}));
    setBusy("");
    if (!response.ok) {
      setMessage(data.message || "Não foi possível enviar a imagem.");
      return;
    }
    router.refresh();
  }

  async function removeSlot(kitId: string, slot: ThemeUploadSlot) {
    setBusy(`asset:${kitId}:${slot}`);
    const response = await fetch(`/api/owner/theme-kits/${kitId}/assets`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slot }),
    });
    setBusy("");
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.message || "Não foi possível remover a imagem.");
      return;
    }
    router.refresh();
  }

  async function deleteKit(kit: ThemeLibraryItem) {
    if (!confirm(`Excluir o kit “${kit.name}” e todos os arquivos dele?`)) return;
    setBusy(`delete:${kit.id}`);
    const response = await fetch(`/api/owner/theme-kits/${kit.id}`, { method: "DELETE" });
    setBusy("");
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.message || "Não foi possível excluir o kit.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="theme-library-manager">
      <section className="theme-library-create">
        <div>
          <p className="gestao-kicker">Biblioteca visual</p>
          <h1>Kits de decoração</h1>
          <p>Cadastre somente os arquivos finais. O editor usa estes kits sem precisar de novo deploy.</p>
        </div>

        <form
          onSubmit={event => {
            event.preventDefault();
            void createKit(event.currentTarget);
          }}
        >
          <label>
            <span>Nome do kit</span>
            <input name="name" required placeholder="Ex.: Floral azul clássico" />
          </label>
          <label>
            <span>Categoria</span>
            <input name="category" placeholder="Ex.: Casamento" />
          </label>
          <label className="is-wide">
            <span>Descrição</span>
            <input name="description" placeholder="Opcional" />
          </label>
          <button className="gestao-primary-action" disabled={busy === "create"}>
            <PackagePlus size={16} /> {busy === "create" ? "Criando..." : "Criar kit vazio"}
          </button>
        </form>
      </section>

      {message ? <p className="theme-library-message">{message}</p> : null}

      {!kits.length ? (
        <section className="theme-library-empty">
          <ImagePlus size={28} />
          <strong>Biblioteca zerada</strong>
          <p>Crie o primeiro kit e suba seus PNG/WebP finais em cada posição padronizada.</p>
        </section>
      ) : (
        <div className="theme-library-list">
          {kits.map(kit => {
            const draft = drafts[kit.id] || draftFromKit(kit);
            return (
              <article className="theme-library-kit" key={kit.id}>
                <header>
                  <div>
                    <strong>{kit.name}</strong>
                    <small>{kit.category || "Sem categoria"} · {kit.slug}</small>
                  </div>
                  <button
                    type="button"
                    className="theme-library-delete"
                    disabled={busy === `delete:${kit.id}`}
                    onClick={() => void deleteKit(kit)}
                  >
                    <Trash2 size={15} /> Excluir kit
                  </button>
                </header>

                <div className="theme-library-kit-meta">
                  <label>
                    <span>Nome</span>
                    <input
                      value={draft.name}
                      onChange={event => setDrafts(current => ({
                        ...current,
                        [kit.id]: { ...draft, name: event.target.value },
                      }))}
                    />
                  </label>
                  <label>
                    <span>Categoria</span>
                    <input
                      value={draft.category}
                      onChange={event => setDrafts(current => ({
                        ...current,
                        [kit.id]: { ...draft, category: event.target.value },
                      }))}
                    />
                  </label>
                  <label className="is-wide">
                    <span>Descrição</span>
                    <input
                      value={draft.description}
                      onChange={event => setDrafts(current => ({
                        ...current,
                        [kit.id]: { ...draft, description: event.target.value },
                      }))}
                    />
                  </label>
                  <label>
                    <span>Tags, separadas por vírgula</span>
                    <input
                      value={draft.tags}
                      onChange={event => setDrafts(current => ({
                        ...current,
                        [kit.id]: { ...draft, tags: event.target.value },
                      }))}
                    />
                  </label>
                  <label>
                    <span>Paleta HEX, separada por vírgula</span>
                    <input
                      value={draft.palette}
                      placeholder="#12308e, #ffffff"
                      onChange={event => setDrafts(current => ({
                        ...current,
                        [kit.id]: { ...draft, palette: event.target.value },
                      }))}
                    />
                  </label>
                  <label className="theme-library-active">
                    <input
                      type="checkbox"
                      checked={draft.isActive}
                      onChange={event => setDrafts(current => ({
                        ...current,
                        [kit.id]: { ...draft, isActive: event.target.checked },
                      }))}
                    />
                    <span>Disponível no editor</span>
                  </label>
                  <button
                    type="button"
                    className="gestao-secondary-action"
                    disabled={busy === `save:${kit.id}`}
                    onClick={() => void saveKit(kit)}
                  >
                    <Save size={15} /> {busy === `save:${kit.id}` ? "Salvando..." : "Salvar dados"}
                  </button>
                </div>

                <div className="theme-slot-grid">
                  {THEME_SLOT_DEFINITIONS.map(definition => {
                    const asset = slotAsset(kit, definition.slot);
                    const assetBusy = busy === `asset:${kit.id}:${definition.slot}`;
                    return (
                      <section className="theme-slot-card" key={definition.slot}>
                        <div className="theme-slot-preview">
                          {asset ? <img src={asset.src} alt="" /> : <ImagePlus size={24} />}
                        </div>
                        <div className="theme-slot-copy">
                          <strong>{definition.label}</strong>
                          <small>{definition.hint}</small>
                          {asset ? <span>{Math.max(1, Math.round(asset.bytes / 1024))} KB · {asset.mimeType}</span> : <span>Vazio</span>}
                        </div>
                        <div className="theme-slot-actions">
                          <label>
                            <Upload size={14} />
                            <span>{asset ? "Substituir" : "Enviar arquivo"}</span>
                            <input
                              type="file"
                              accept="image/png,image/webp,image/jpeg"
                              disabled={assetBusy}
                              onChange={event => {
                                const file = event.target.files?.[0] || null;
                                void uploadSlot(kit.id, definition.slot, file);
                                event.currentTarget.value = "";
                              }}
                            />
                          </label>
                          {asset ? (
                            <button
                              type="button"
                              aria-label="Remover arquivo"
                              disabled={assetBusy}
                              onClick={() => void removeSlot(kit.id, definition.slot)}
                            >
                              <X size={15} />
                            </button>
                          ) : null}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
