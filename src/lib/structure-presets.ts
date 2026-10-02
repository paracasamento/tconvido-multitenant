import type { InviteElement, InvitePartStyle } from "@/lib/invite-builder";

export type StructureSlot = "event-date" | "action-menu" | "event-location";
export type StructureCategory = "date" | "actions" | "location";

export type StructurePreset = {
  id: string;
  name: string;
  category: StructureCategory;
  description: string;
  slot: StructureSlot;
  variant: string;
  width: number;
  height: number;
  x: number;
  y: number;
  color?: string;
  fontFamily?: string;
  partStyles?: Record<string, InvitePartStyle>;
};

const serif = "Cormorant Garamond";
const sans = "Inter";

export const STRUCTURE_PRESETS: StructurePreset[] = [
  {
    id: "date-classic-calendar",
    name: "Data clássica",
    category: "date",
    description: "Dia da semana acima, mês e ano nas laterais e o dia em destaque.",
    slot: "event-date",
    variant: "classic-calendar",
    x: 12,
    y: 46,
    width: 76,
    height: 18,
    color: "#29453A",
    fontFamily: serif,
    partStyles: {
      weekday: { fontFamily: sans, fontSize: 11, fontWeight: 700, letterSpacing: 2.4, textTransform: "uppercase" },
      month: { fontSize: 20, fontWeight: 500, textTransform: "capitalize" },
      day: { fontSize: 54, fontWeight: 500, lineHeight: .88 },
      year: { fontSize: 20, fontWeight: 500 },
      time: { fontFamily: sans, fontSize: 13, fontWeight: 700, letterSpacing: .4 },
    },
  },
  {
    id: "date-editorial",
    name: "Data editorial",
    category: "date",
    description: "Composição elegante com dia grande, linhas finas e mês em destaque.",
    slot: "event-date",
    variant: "editorial",
    x: 14,
    y: 47,
    width: 72,
    height: 20,
    color: "#283C33",
    fontFamily: serif,
    partStyles: {
      weekday: { fontFamily: sans, fontSize: 10, letterSpacing: 3, textTransform: "uppercase" },
      month: { fontSize: 17, fontWeight: 400, textTransform: "capitalize" },
      day: { fontSize: 58, fontWeight: 500, lineHeight: .82 },
      year: { fontSize: 17, fontWeight: 400 },
      time: { fontSize: 17, fontWeight: 500 },
    },
  },
  {
    id: "date-stacked",
    name: "Data vertical",
    category: "date",
    description: "Dia grande ao centro com mês, ano e horário empilhados.",
    slot: "event-date",
    variant: "stacked",
    x: 25,
    y: 46,
    width: 50,
    height: 22,
    color: "#304A3B",
    fontFamily: serif,
    partStyles: {
      weekday: { fontFamily: sans, fontSize: 9, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase" },
      month: { fontFamily: sans, fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase" },
      day: { fontSize: 64, fontWeight: 500, lineHeight: .82 },
      year: { fontFamily: sans, fontSize: 11, fontWeight: 600, letterSpacing: 1.4 },
      time: { fontSize: 15, fontWeight: 500 },
    },
  },
  {
    id: "date-minimal",
    name: "Data minimalista",
    category: "date",
    description: "Formato compacto e contemporâneo para layouts limpos.",
    slot: "event-date",
    variant: "minimal",
    x: 17,
    y: 50,
    width: 66,
    height: 10,
    color: "#2D3430",
    fontFamily: sans,
    partStyles: {
      weekday: { fontSize: 9, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase" },
      month: { fontSize: 13, fontWeight: 600, textTransform: "uppercase" },
      day: { fontSize: 23, fontWeight: 700 },
      year: { fontSize: 13, fontWeight: 600 },
      time: { fontSize: 12, fontWeight: 600 },
    },
  },

  {
    id: "actions-round",
    name: "Ações circulares",
    category: "actions",
    description: "Ícones circulares como nos convites interativos tradicionais.",
    slot: "action-menu",
    variant: "round",
    x: 7,
    y: 74,
    width: 86,
    height: 17,
    color: "#284638",
    fontFamily: sans,
  },
  {
    id: "actions-outline",
    name: "Ações contornadas",
    category: "actions",
    description: "Botões com ícone e texto, visual leve e sofisticado.",
    slot: "action-menu",
    variant: "outline",
    x: 8,
    y: 74,
    width: 84,
    height: 15,
    color: "#32473C",
    fontFamily: sans,
  },
  {
    id: "actions-pills",
    name: "Ações em pílula",
    category: "actions",
    description: "Três botões horizontais compactos para layouts modernos.",
    slot: "action-menu",
    variant: "pills",
    x: 6,
    y: 76,
    width: 88,
    height: 11,
    color: "#ffffff",
    fontFamily: sans,
    partStyles: {
      "map-action": { backgroundColor: "#29483A" },
      "rsvp-action": { backgroundColor: "#29483A" },
      "gifts-action": { backgroundColor: "#29483A" },
    },
  },

  {
    id: "location-centered",
    name: "Local centralizado",
    category: "location",
    description: "Local, cidade e horário centralizados com ícone discreto.",
    slot: "event-location",
    variant: "centered",
    x: 13,
    y: 64,
    width: 74,
    height: 13,
    color: "#2B4035",
    fontFamily: serif,
    partStyles: {
      venue: { fontSize: 18, fontWeight: 600 },
      city: { fontFamily: sans, fontSize: 11, lineHeight: 1.25 },
      time: { fontFamily: sans, fontSize: 11, fontWeight: 700 },
    },
  },
  {
    id: "location-card",
    name: "Local em card",
    category: "location",
    description: "Informações do local dentro de um card delicado.",
    slot: "event-location",
    variant: "card",
    x: 12,
    y: 63,
    width: 76,
    height: 14,
    color: "#2B4035",
    fontFamily: serif,
    partStyles: {
      container: {
        backgroundColor: "rgba(255,255,255,.72)",
        borderColor: "rgba(43,64,53,.22)",
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 18,
        paddingTop: 12,
        paddingRight: 14,
        paddingBottom: 12,
        paddingLeft: 14,
      },
      venue: { fontSize: 17, fontWeight: 600 },
      city: { fontFamily: sans, fontSize: 10 },
      time: { fontFamily: sans, fontSize: 10, fontWeight: 700 },
    },
  },
  {
    id: "location-inline",
    name: "Local compacto",
    category: "location",
    description: "Linha compacta para convites com pouco espaço.",
    slot: "event-location",
    variant: "inline",
    x: 10,
    y: 66,
    width: 80,
    height: 8,
    color: "#2B4035",
    fontFamily: sans,
    partStyles: {
      venue: { fontSize: 11, fontWeight: 700 },
      city: { fontSize: 10 },
      time: { fontSize: 10, fontWeight: 700 },
    },
  },
];

export const STRUCTURE_CATEGORY_LABELS: Record<StructureCategory, string> = {
  date: "Data",
  actions: "Botões e ações",
  location: "Local e horário",
};

export function isStructureSlot(slot: InviteElement["slot"]): slot is StructureSlot {
  return slot === "event-date" || slot === "action-menu" || slot === "event-location";
}

export function presetsForSlot(slot: InviteElement["slot"]) {
  return STRUCTURE_PRESETS.filter(preset => preset.slot === slot);
}
