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
  placement: Partial<InviteElement>;
};

export type ThemeLibraryBackground = {
  id: string;
  name: string;
  src: string;
};

export type ThemeLibraryItem = {
  id: string;
  name: string;
  category: string;
  tags: string[];
  preview: string;
  palette: string[];
  backgrounds: ThemeLibraryBackground[];
  assets: ThemeLibraryAsset[];
};

const placement: Record<ThemeAssetSlot, Partial<InviteElement>> = {
  top_left: { x: 0, y: 0, width: 43, height: 23, zIndex: 2 },
  top_right: { x: 57, y: 0, width: 43, height: 23, zIndex: 2 },
  top_full: { x: 8, y: 0, width: 84, height: 17, zIndex: 2 },
  bottom_left: { x: 0, y: 77, width: 43, height: 23, zIndex: 2 },
  bottom_right: { x: 57, y: 77, width: 43, height: 23, zIndex: 2 },
  bottom_full: { x: 4, y: 80, width: 92, height: 18, zIndex: 2 },
  divider_horizontal: { x: 21, y: 47, width: 58, height: 7, zIndex: 2 },
  frame: { x: 12, y: 26, width: 76, height: 48, zIndex: 2 },
};

function assets(themeId: string): ThemeLibraryAsset[] {
  const labels: Array<[ThemeAssetSlot, string]> = [
    ["top_left", "Topo esquerdo"],
    ["top_right", "Topo direito"],
    ["top_full", "Topo inteiro"],
    ["bottom_left", "Rodapé esquerdo"],
    ["bottom_right", "Rodapé direito"],
    ["bottom_full", "Rodapé inteiro"],
    ["divider_horizontal", "Separador"],
    ["frame", "Moldura"],
  ];

  return labels.map(([slot, name]) => ({
    id: `${themeId}-${slot}`,
    name,
    slot,
    src: `/themes/${themeId}/assets/${slot}.webp`,
    placement: placement[slot],
  }));
}

function backgrounds(themeId: string): ThemeLibraryBackground[] {
  return [
    { id: `${themeId}-paper`, name: "Papel suave", src: `/themes/${themeId}/backgrounds/paper.webp` },
    { id: `${themeId}-pattern`, name: "Textura temática", src: `/themes/${themeId}/backgrounds/pattern.webp` },
  ];
}

export const THEME_LIBRARY: ThemeLibraryItem[] = [
  {
    id: "floral-azul-classico",
    name: "Floral Azul Clássico",
    category: "Casamento e chá de panela",
    tags: ["casamento", "cha de panela", "floral", "azul", "classico"],
    preview: "/themes/floral-azul-classico/preview.webp",
    palette: ["#294b73", "#7fa9c9", "#f6f0e2", "#5f6d43"],
    backgrounds: backgrounds("floral-azul-classico"),
    assets: assets("floral-azul-classico"),
  },
  {
    id: "cha-de-panela-rosa",
    name: "Chá de Panela Rosa",
    category: "Chá de panela",
    tags: ["cha de panela", "cozinha", "rosa", "aquarela"],
    preview: "/themes/cha-de-panela-rosa/preview.webp",
    palette: ["#e88783", "#efada0", "#f8ecd9", "#66774f"],
    backgrounds: backgrounds("cha-de-panela-rosa"),
    assets: assets("cha-de-panela-rosa"),
  },
  {
    id: "ursinho-bebe",
    name: "Ursinho Bebê",
    category: "Chá de bebê",
    tags: ["cha de bebe", "bebe", "ursinho", "neutro", "infantil"],
    preview: "/themes/ursinho-bebe/preview.webp",
    palette: ["#ad7345", "#ead2a8", "#bdc49b", "#8fb8d8"],
    backgrounds: backgrounds("ursinho-bebe"),
    assets: assets("ursinho-bebe"),
  },
  {
    id: "safari-infantil",
    name: "Safari Infantil",
    category: "Infantil e chá de bebê",
    tags: ["infantil", "safari", "animais", "cha de bebe", "verde"],
    preview: "/themes/safari-infantil/preview.webp",
    palette: ["#5e764a", "#9a6739", "#f0d4a2", "#e8962f"],
    backgrounds: backgrounds("safari-infantil"),
    assets: assets("safari-infantil"),
  },
];

export function getThemeLibraryItem(id: string) {
  return THEME_LIBRARY.find(theme => theme.id === id) || THEME_LIBRARY[0];
}
