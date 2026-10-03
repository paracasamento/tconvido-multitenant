import {
  defaultInviteVisualConfig,
  normalizeInviteVisualConfig,
  type InviteElement,
  type InvitePartStyle,
  type InviteVisualConfig,
} from "@/lib/invite-builder";
import type { EventType } from "@/lib/event-types";

export type InvitationModelDefinition = {
  id: string;
  name: string;
  description: string;
  eventTypes: EventType[];
  palette: {
    background: string;
    paper: string;
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    border: string;
  };
  headingFont: string;
  bodyFont: string;
  decoration: "none" | "floral";
};

const ALL_EVENTS: EventType[] = [
  "wedding",
  "kids_birthday",
  "quinceanera",
  "baby_shower",
  "housewarming",
];

export const INVITATION_MODELS: InvitationModelDefinition[] = [
  {
    id: "editorial-clean",
    name: "Editorial clean",
    description: "Composição clara, tipografia elegante e foco total nas informações do evento.",
    eventTypes: ALL_EVENTS,
    palette: {
      background: "#f7f4ee",
      paper: "#ffffff",
      primary: "#252525",
      secondary: "#5e5a54",
      accent: "#8f7655",
      surface: "rgba(255,255,255,.76)",
      border: "rgba(91,78,60,.24)",
    },
    headingFont: "Cormorant Garamond",
    bodyFont: "Inter",
    decoration: "none",
  },
  {
    id: "classic-romance",
    name: "Clássico romântico",
    description: "Estrutura delicada com divisores florais e contraste suave para ocasiões formais.",
    eventTypes: ["wedding", "quinceanera"],
    palette: {
      background: "#fbf7f2",
      paper: "#fffdf9",
      primary: "#704b56",
      secondary: "#806c72",
      accent: "#b28b68",
      surface: "rgba(255,253,249,.78)",
      border: "rgba(178,139,104,.48)",
    },
    headingFont: "Cormorant Garamond",
    bodyFont: "Inter",
    decoration: "floral",
  },
  {
    id: "soft-celebration",
    name: "Celebração suave",
    description: "Visual leve e acolhedor, pensado para aniversário infantil e chá de bebê sem prender o convite a um tema específico.",
    eventTypes: ["kids_birthday", "baby_shower"],
    palette: {
      background: "#f4f2ec",
      paper: "#ffffff",
      primary: "#52677b",
      secondary: "#6d7375",
      accent: "#b58c73",
      surface: "rgba(255,255,255,.82)",
      border: "rgba(82,103,123,.20)",
    },
    headingFont: "Cormorant Garamond",
    bodyFont: "Inter",
    decoration: "none",
  },
  {
    id: "warm-home",
    name: "Casa acolhedora",
    description: "Paleta quente e composição discreta para celebrar casa nova e encontros intimistas.",
    eventTypes: ["housewarming"],
    palette: {
      background: "#f2eee7",
      paper: "#fbfaf7",
      primary: "#5e5548",
      secondary: "#756d63",
      accent: "#9a7555",
      surface: "rgba(251,250,247,.82)",
      border: "rgba(94,85,72,.24)",
    },
    headingFont: "Cormorant Garamond",
    bodyFont: "Inter",
    decoration: "none",
  },
  {
    id: "modern-night",
    name: "Moderno noturno",
    description: "Contraste mais marcante e estrutura contemporânea para celebrações de presença forte.",
    eventTypes: ["wedding", "quinceanera"],
    palette: {
      background: "#202124",
      paper: "#292b2f",
      primary: "#f6f0e5",
      secondary: "#d0c9bd",
      accent: "#c4a66f",
      surface: "rgba(255,255,255,.07)",
      border: "rgba(196,166,111,.42)",
    },
    headingFont: "Cormorant Garamond",
    bodyFont: "Inter",
    decoration: "none",
  },
];

export function getInvitationModel(id: string) {
  return INVITATION_MODELS.find(model => model.id === id) || null;
}

function stylePart(
  part: InvitePartStyle,
  model: InvitationModelDefinition
): InvitePartStyle {
  const next = { ...part };
  const { palette } = model;

  if (next.color) next.color = palette.primary;
  if (next.borderColor && next.borderStyle !== "none") next.borderColor = palette.border;
  if (next.backgroundColor && next.backgroundColor !== "transparent") {
    next.backgroundColor = palette.surface;
  }
  if (next.shadowColor) next.shadowColor = "rgba(0,0,0,.08)";
  if (next.fontFamily) {
    next.fontFamily =
      (next.fontSize || 0) >= 18 ? model.headingFont : model.bodyFont;
  }

  return next;
}

function styleElement(
  element: InviteElement,
  model: InvitationModelDefinition
): InviteElement {
  const next: InviteElement = structuredClone(element);
  const { palette } = model;

  if (next.type === "image") {
    const isKitchenLegacy = /kitchen|cozinha/i.test(next.id + " " + next.name);
    const isFloral = /floral|divider/i.test(next.id + " " + next.name);
    next.visible =
      !isKitchenLegacy &&
      model.decoration === "floral" &&
      isFloral;
    return next;
  }

  if (next.type === "text") {
    next.color = /label|weekday|month|year|open/i.test(next.id)
      ? palette.accent
      : palette.primary;
    next.fontFamily =
      (next.fontSize || 0) >= 20 ? model.headingFont : model.bodyFont;
  }

  if (next.type === "link") {
    const primary = /rsvp/i.test(next.id);
    next.backgroundColor = primary ? palette.primary : palette.surface;
    next.color = primary ? palette.paper : palette.primary;
    next.borderColor = primary ? palette.primary : palette.border;
    next.fontFamily = model.bodyFont;
    next.shadowColor = "rgba(0,0,0,.08)";
  }

  if (next.type === "box") {
    next.backgroundColor = palette.surface;
    next.borderColor = palette.border;
    next.shadowColor = "rgba(0,0,0,.06)";
  }

  if (next.partStyles) {
    next.partStyles = Object.fromEntries(
      Object.entries(next.partStyles).map(([id, part]) => [
        id,
        stylePart(part, model),
      ])
    );
  }

  if (next.scenarioPartStyles) {
    next.scenarioPartStyles = Object.fromEntries(
      Object.entries(next.scenarioPartStyles).map(([scenario, parts]) => [
        scenario,
        Object.fromEntries(
          Object.entries(parts).map(([id, part]) => [
            id,
            stylePart(part, model),
          ])
        ),
      ])
    );
  }

  return next;
}

const introByType: Record<EventType, string> = {
  wedding: "Celebre este momento com a gente.",
  kids_birthday: "Uma comemoração especial está chegando.",
  quinceanera: "Uma noite muito especial está chegando.",
  baby_shower: "Esperamos você para celebrar esta doce espera.",
  housewarming: "Venha celebrar este novo começo com a gente.",
};

export function createInvitationModelConfig(
  modelId: string,
  eventType: EventType
): InviteVisualConfig {
  const model = getInvitationModel(modelId);
  if (!model || !model.eventTypes.includes(eventType)) {
    throw new Error("Modelo incompatível com este tipo de evento.");
  }

  const config = normalizeInviteVisualConfig(
    structuredClone(defaultInviteVisualConfig)
  );

  for (const screen of Object.values(config.screens)) {
    screen.backgroundColor = model.palette.background;
    screen.paperOpacity = model.id === "modern-night" ? 0.18 : 0.42;
    screen.elements = screen.elements.map(element =>
      styleElement(element, model)
    );
  }

  if (config.rsvpScenarios) {
    for (const scenario of Object.values(config.rsvpScenarios)) {
      scenario.elements = scenario.elements.map(element =>
        styleElement(element, model)
      );
      scenario.screenStyle = {
        ...(scenario.screenStyle || {}),
        backgroundColor: model.palette.background,
        paperOpacity: model.id === "modern-night" ? 0.18 : 0.42,
      };
    }
  }

  const coverIdentity = config.screens.cover.elements.find(
    element => element.id === "cover-names"
  );
  if (coverIdentity) coverIdentity.text = "{{event_identity}}";

  const inviteIdentity = config.screens.invite.elements.find(
    element => element.id === "invite-names"
  );
  if (inviteIdentity) inviteIdentity.text = "{{event_identity}}";

  const accessCopy = config.screens.access.elements.find(
    element => element.id === "access-copy"
  );
  if (accessCopy) {
    accessCopy.text =
      "Informe seu nome e a senha do convite para abrir seu acesso.";
  }

  const inviteIntro = config.screens.invite.elements.find(
    element => element.id === "invite-intro"
  );
  if (inviteIntro) inviteIntro.text = introByType[eventType];

  return config;
}
