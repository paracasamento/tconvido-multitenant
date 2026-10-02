import type { InviteElement } from "@/lib/invite-builder";

export type InviteComponentPresetCategory =
  | "date"
  | "button"
  | "actions"
  | "info"
  | "heading";

export type InviteComponentPresetElement = Partial<InviteElement> & {
  type: InviteElement["type"];
  name: string;
};

export type InviteComponentPreset = {
  id: string;
  capabilities?: string[];
  eventTypes?: string[];
  name: string;
  category: InviteComponentPresetCategory;
  description: string;
  previewLabel: string;
  elements: InviteComponentPresetElement[];
};

const text = (
  name: string,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  extra: Partial<InviteElement> = {}
): InviteComponentPresetElement => ({
  type: "text",
  name,
  text: value,
  x,
  y,
  width,
  height,
  opacity: 1,
  rotate: 0,
  scaleX: 1,
  scaleY: 1,
  visible: true,
  locked: false,
  color: "#2f4739",
  fontSize,
  fontFamily: "Cormorant Garamond",
  fontWeight: 400,
  textAlign: "center",
  lineHeight: 1.05,
  ...extra,
});

const line = (
  name: string,
  x: number,
  y: number,
  width: number,
  color = "#b79a66"
): InviteComponentPresetElement => ({
  type: "box",
  name,
  x,
  y,
  width,
  height: 0.18,
  opacity: 1,
  rotate: 0,
  scaleX: 1,
  scaleY: 1,
  visible: true,
  locked: false,
  backgroundColor: color,
  borderWidth: 0,
  borderRadius: 999,
});

const link = (
  name: string,
  label: string,
  href: string,
  x: number,
  y: number,
  width: number,
  height: number,
  extra: Partial<InviteElement> = {}
): InviteComponentPresetElement => ({
  type: "link",
  name,
  text: label,
  href,
  x,
  y,
  width,
  height,
  opacity: 1,
  rotate: 0,
  scaleX: 1,
  scaleY: 1,
  visible: true,
  locked: false,
  color: "#ffffff",
  backgroundColor: "#2f4739",
  borderColor: "#2f4739",
  borderWidth: 1,
  borderStyle: "solid",
  borderRadius: 999,
  fontSize: 13,
  fontFamily: "Inter",
  fontWeight: 700,
  textAlign: "center",
  letterSpacing: .5,
  paddingX: 10,
  paddingY: 4,
  ...extra,
});

export const INVITE_COMPONENT_PRESET_CATEGORIES: Array<{
  id: InviteComponentPresetCategory;
  label: string;
}> = [
  { id: "date", label: "Datas" },
  { id: "button", label: "Botões" },
  { id: "actions", label: "Ações" },
  { id: "info", label: "Informações" },
  { id: "heading", label: "Títulos" },
];

export const INVITE_COMPONENT_PRESETS: InviteComponentPreset[] = [
  {
    id: "date-split-classic",
    name: "Data clássica dividida",
    category: "date",
    description: "Mês, dia e ano em colunas com dia da semana e horário.",
    previewLabel: "AGOSTO · 17 · 2026",
    elements: [
      text("Dia da semana", "{{weekday}}", 36, 38, 28, 4, 12, {
        fontFamily: "Inter",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 3.8,
      }),
      text("Mês", "{{month}}", 10, 44, 27, 7, 21, {
        textTransform: "capitalize",
      }),
      line("Linha mês", 10, 52, 27),
      text("Dia", "{{day}}", 39, 41, 22, 12, 52, {
        fontWeight: 500,
        lineHeight: .95,
      }),
      text("Ano", "{{year}}", 63, 44, 27, 7, 21),
      line("Linha ano", 63, 52, 27),
      text("Horário", "às {{time}}", 34, 55, 32, 5, 18, {
        fontWeight: 500,
      }),
    ],
  },
  {
    id: "date-editorial",
    name: "Data editorial",
    category: "date",
    description: "Composição vertical elegante com o dia em destaque.",
    previewLabel: "SÁBADO / 21 / JUNHO",
    elements: [
      text("Dia da semana", "{{weekday}}", 30, 39, 40, 4, 11, {
        fontFamily: "Inter",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 4.2,
      }),
      text("Dia", "{{day}}", 30, 43, 40, 12, 58, {
        fontWeight: 500,
        lineHeight: .9,
      }),
      text("Mês e ano", "{{month}} · {{year}}", 22, 55, 56, 5, 18, {
        textTransform: "uppercase",
        letterSpacing: 1.5,
      }),
      text("Horário", "{{time}}", 32, 61, 36, 4, 14, {
        fontFamily: "Inter",
        fontWeight: 600,
      }),
    ],
  },
  {
    id: "date-minimal-line",
    name: "Data minimalista",
    category: "date",
    description: "Uma linha limpa para convites modernos.",
    previewLabel: "sábado, 21 de junho",
    elements: [
      line("Linha superior", 18, 44, 64, "#cbbda5"),
      text("Data completa", "{{weekday}}, {{day}} de {{month}} de {{year}}", 12, 46, 76, 6, 18, {
        fontFamily: "Inter",
        fontWeight: 500,
        textTransform: "capitalize",
      }),
      text("Horário", "{{time}}", 34, 53, 32, 4, 13, {
        fontFamily: "Inter",
        fontWeight: 700,
        letterSpacing: 1.2,
      }),
      line("Linha inferior", 18, 58, 64, "#cbbda5"),
    ],
  },
  {
    id: "date-number-focus",
    name: "Número em destaque",
    category: "date",
    description: "Dia grande, mês e ano discretos.",
    previewLabel: "21 / JUNHO 2026",
    elements: [
      text("Mês", "{{month}}", 32, 39, 36, 5, 15, {
        fontFamily: "Inter",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 3,
      }),
      text("Dia", "{{day}}", 28, 44, 44, 14, 64, {
        fontWeight: 500,
        lineHeight: .9,
      }),
      text("Ano", "{{year}}", 35, 57, 30, 4, 14, {
        fontFamily: "Inter",
        fontWeight: 600,
        letterSpacing: 2,
      }),
      text("Dia e hora", "{{weekday}} · {{time}}", 25, 62, 50, 4, 12, {
        fontFamily: "Inter",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: 1,
      }),
    ],
  },
  {
    id: "date-card-soft",
    name: "Data em card",
    category: "date",
    description: "Bloco suave para destacar data e horário.",
    previewLabel: "21 JUN · 18:30",
    elements: [
      {
        type: "box",
        name: "Card da data",
        x: 18,
        y: 42,
        width: 64,
        height: 15,
        opacity: 1,
        rotate: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        locked: false,
        backgroundColor: "rgba(255,255,255,.72)",
        borderColor: "#c7b69a",
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 22,
        shadowX: 0,
        shadowY: 6,
        shadowBlur: 18,
        shadowSpread: 0,
        shadowColor: "rgba(25,32,28,.08)",
      },
      text("Dia", "{{day}}", 22, 45, 18, 8, 38, { fontWeight: 600 }),
      text("Mês e ano", "{{month}}\n{{year}}", 40, 45, 24, 8, 14, {
        fontFamily: "Inter",
        fontWeight: 700,
        textTransform: "uppercase",
        lineHeight: 1.15,
      }),
      text("Horário", "{{time}}", 63, 47, 15, 5, 13, {
        fontFamily: "Inter",
        fontWeight: 700,
      }),
    ],
  },

  {
    id: "button-solid",
    capabilities: ["rsvp"],
    name: "Botão sólido",
    category: "button",
    description: "Cápsula forte com alto contraste.",
    previewLabel: "CONFIRMAR PRESENÇA",
    elements: [
      link("Botão sólido", "CONFIRMAR PRESENÇA", "/presenca", 20, 48, 60, 7, {
        icon: "check",
        customCss: "gap:8px;",
      }),
    ],
  },
  {
    id: "button-outline",
    capabilities: ["gifts"],
    name: "Botão contorno",
    category: "button",
    description: "Leve e elegante para ações secundárias.",
    previewLabel: "VER PRESENTES",
    elements: [
      link("Botão contorno", "VER PRESENTES", "/presentes", 20, 48, 60, 7, {
        icon: "gift",
        color: "#2f4739",
        backgroundColor: "rgba(255,255,255,.16)",
        borderColor: "#2f4739",
        borderWidth: 1.2,
        customCss: "gap:8px;",
      }),
    ],
  },
  {
    id: "button-soft",
    name: "Botão suave",
    category: "button",
    description: "Fundo claro e sombra discreta.",
    previewLabel: "COMO CHEGAR",
    elements: [
      link("Botão suave", "COMO CHEGAR", "{{maps_url}}", 20, 48, 60, 7, {
        icon: "map-pin",
        color: "#2f4739",
        backgroundColor: "#f4efe5",
        borderColor: "#ded3bf",
        shadowX: 0,
        shadowY: 6,
        shadowBlur: 18,
        shadowSpread: 0,
        shadowColor: "rgba(25,32,28,.10)",
        customCss: "gap:8px;",
      }),
    ],
  },
  {
    id: "button-minimal",
    name: "Botão minimalista",
    category: "button",
    description: "Somente texto, ícone e linha inferior.",
    previewLabel: "SAIBA MAIS →",
    elements: [
      link("Botão minimalista", "SAIBA MAIS", "#", 25, 48, 50, 6, {
        icon: "chevron-right",
        color: "#2f4739",
        backgroundColor: "transparent",
        borderColor: "#2f4739",
        borderWidth: 0,
        borderRadius: 0,
        customCss: "gap:7px;border-bottom:1px solid currentColor;",
      }),
    ],
  },

  {
    id: "actions-three",
    capabilities: ["rsvp","gifts"],
    name: "3 ações com ícones",
    category: "actions",
    description: "Local, confirmação e presentes em uma linha.",
    previewLabel: "LOCAL · PRESENÇA · PRESENTES",
    elements: [
      link("Como chegar", "COMO CHEGAR", "{{maps_url}}", 6, 48, 27, 10, {
        icon: "map-pin",
        color: "#2f4739",
        backgroundColor: "rgba(255,255,255,.62)",
        borderColor: "#b8a98d",
        borderRadius: 18,
        fontSize: 10,
        customCss: "gap:5px;flex-direction:column;",
      }),
      link("Confirmar presença", "PRESENÇA", "/presenca", 36.5, 48, 27, 10, {
        icon: "check",
        color: "#2f4739",
        backgroundColor: "rgba(255,255,255,.62)",
        borderColor: "#b8a98d",
        borderRadius: 18,
        fontSize: 10,
        customCss: "gap:5px;flex-direction:column;",
      }),
      link("Lista de presentes", "PRESENTES", "/presentes", 67, 48, 27, 10, {
        icon: "gift",
        color: "#2f4739",
        backgroundColor: "rgba(255,255,255,.62)",
        borderColor: "#b8a98d",
        borderRadius: 18,
        fontSize: 10,
        customCss: "gap:5px;flex-direction:column;",
      }),
    ],
  },
  {
    id: "actions-circular",
    capabilities: ["rsvp","gifts"],
    name: "Ações circulares",
    category: "actions",
    description: "Três atalhos circulares no estilo convite interativo.",
    previewLabel: "○ LOCAL  ○ RSVP  ○ PRESENTES",
    elements: [
      link("Local circular", "LOCAL", "{{maps_url}}", 9, 48, 24, 12, {
        icon: "map-pin",
        color: "#2f4739",
        backgroundColor: "rgba(255,255,255,.26)",
        borderColor: "#b99d67",
        borderWidth: 1.4,
        borderRadius: 999,
        fontSize: 10,
        customCss: "gap:4px;flex-direction:column;",
      }),
      link("RSVP circular", "CONFIRMAR", "/presenca", 38, 48, 24, 12, {
        icon: "check",
        color: "#2f4739",
        backgroundColor: "rgba(255,255,255,.26)",
        borderColor: "#b99d67",
        borderWidth: 1.4,
        borderRadius: 999,
        fontSize: 10,
        customCss: "gap:4px;flex-direction:column;",
      }),
      link("Presentes circular", "PRESENTES", "/presentes", 67, 48, 24, 12, {
        icon: "gift",
        color: "#2f4739",
        backgroundColor: "rgba(255,255,255,.26)",
        borderColor: "#b99d67",
        borderWidth: 1.4,
        borderRadius: 999,
        fontSize: 10,
        customCss: "gap:4px;flex-direction:column;",
      }),
    ],
  },

  {
    id: "info-location",
    name: "Local e horário",
    category: "info",
    description: "Bloco central com local, cidade, data e horário.",
    previewLabel: "LOCAL · CIDADE · 18:30",
    elements: [
      text("Nome do local", "{{venue}}", 12, 43, 76, 6, 24, {
        fontWeight: 600,
      }),
      text("Cidade", "{{city}}", 15, 50, 70, 4, 13, {
        fontFamily: "Inter",
        fontWeight: 500,
      }),
      text("Data e horário", "{{date}} · {{time}}", 18, 55, 64, 4, 12, {
        fontFamily: "Inter",
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: "uppercase",
      }),
    ],
  },
  {
    id: "info-invite-summary",
    name: "Resumo do convite",
    category: "info",
    description: "Título do evento, data e local em bloco compacto.",
    previewLabel: "TÍTULO · DATA · LOCAL",
    elements: [
      text("Título do evento", "{{title}}", 10, 40, 80, 7, 26, {
        fontWeight: 600,
      }),
      text("Data", "{{weekday}}, {{day}} de {{month}}", 15, 48, 70, 4, 13, {
        fontFamily: "Inter",
        fontWeight: 600,
      }),
      text("Local", "{{venue}}{{city_suffix}}", 12, 53, 76, 5, 13, {
        fontFamily: "Inter",
        fontWeight: 500,
      }),
    ],
  },

  {
    id: "heading-elegant",
    eventTypes: ["wedding"],
    name: "Nomes elegantes",
    category: "heading",
    description: "Nomes em destaque com título acima.",
    previewLabel: "VOCÊ ESTÁ CONVIDADO · NOMES",
    elements: [
      text("Chamada", "VOCÊ ESTÁ CONVIDADO", 18, 39, 64, 4, 10, {
        fontFamily: "Inter",
        fontWeight: 700,
        letterSpacing: 2.5,
      }),
      text("Nomes", "{{couple_names}}", 8, 44, 84, 10, 42, {
        fontWeight: 500,
        lineHeight: .95,
      }),
      line("Separador", 30, 56, 40, "#b99d67"),
    ],
  },
  {
    id: "heading-title",
    name: "Título editorial",
    category: "heading",
    description: "Título do evento com nomes em apoio.",
    previewLabel: "CASAMENTO · NOMES",
    elements: [
      text("Título", "{{title}}", 12, 41, 76, 9, 34, {
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: 1.4,
      }),
      text("Nomes", "{{couple_names}}", 16, 51, 68, 5, 18, {
        fontStyle: "italic",
      }),
    ],
  },
];

export function presetsByCategory(category: InviteComponentPresetCategory) {
  return INVITE_COMPONENT_PRESETS.filter(preset => preset.category === category);
}

export function presetsForEvent(eventType:string,capabilities:string[]){
  return INVITE_COMPONENT_PRESETS.filter(preset=>{
    const typeOk=!preset.eventTypes?.length||preset.eventTypes.includes(eventType);
    const capabilityOk=!preset.capabilities?.length||preset.capabilities.every(cap=>capabilities.includes(cap));
    return typeOk&&capabilityOk;
  });
}
