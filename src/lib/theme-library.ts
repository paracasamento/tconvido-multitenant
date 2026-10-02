import type { InviteElement } from "@/lib/invite-builder";

export type ThemeAssetSlot =
  | "top_left"
  | "top_right"
  | "top_full"
  | "bottom_left"
  | "bottom_right"
  | "bottom_full"
  | "divider_horizontal"
  | "frame";

export type ThemeLibraryAsset = {
  id: string;
  name: string;
  slot: ThemeAssetSlot;
  src: string;
  storagePath: string;
  mimeType: string;
  bytes: number;
  placement: Partial<InviteElement>;
};

export type ThemeLibraryBackground = {
  id: string;
  name: string;
  src: string;
  storagePath: string;
  mimeType: string;
  bytes: number;
};

export type ThemeLibraryItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  tags: string[];
  palette: string[];
  preview: string | null;
  isActive: boolean;
  backgrounds: ThemeLibraryBackground[];
  assets: ThemeLibraryAsset[];
};

export const THEME_ASSET_PLACEMENT: Record<ThemeAssetSlot, Partial<InviteElement>> = {
  top_left: { x: 0, y: 0, width: 43, height: 23, zIndex: 2 },
  top_right: { x: 57, y: 0, width: 43, height: 23, zIndex: 2 },
  top_full: { x: 8, y: 0, width: 84, height: 17, zIndex: 2 },
  bottom_left: { x: 0, y: 77, width: 43, height: 23, zIndex: 2 },
  bottom_right: { x: 57, y: 77, width: 43, height: 23, zIndex: 2 },
  bottom_full: { x: 4, y: 80, width: 92, height: 18, zIndex: 2 },
  divider_horizontal: { x: 21, y: 47, width: 58, height: 7, zIndex: 2 },
  frame: { x: 12, y: 26, width: 76, height: 48, zIndex: 2 },
};

export const THEME_SLOT_DEFINITIONS = [
  { slot: "background", label: "Fundo", hint: "Textura ou fundo principal do kit.", kind: "background" },
  { slot: "top_left", label: "Topo esquerdo", hint: "PNG/WebP transparente para o canto superior esquerdo.", kind: "decoration" },
  { slot: "top_right", label: "Topo direito", hint: "PNG/WebP transparente para o canto superior direito.", kind: "decoration" },
  { slot: "top_full", label: "Topo inteiro", hint: "Faixa decorativa horizontal para o topo.", kind: "decoration" },
  { slot: "bottom_left", label: "Rodapé esquerdo", hint: "PNG/WebP transparente para o canto inferior esquerdo.", kind: "decoration" },
  { slot: "bottom_right", label: "Rodapé direito", hint: "PNG/WebP transparente para o canto inferior direito.", kind: "decoration" },
  { slot: "bottom_full", label: "Rodapé inteiro", hint: "Faixa decorativa horizontal para a base.", kind: "decoration" },
  { slot: "divider_horizontal", label: "Separador", hint: "Separador horizontal para dividir conteúdos.", kind: "decoration" },
  { slot: "frame", label: "Moldura", hint: "Moldura central com área interna livre.", kind: "decoration" },
] as const;

export type ThemeUploadSlot = (typeof THEME_SLOT_DEFINITIONS)[number]["slot"];
