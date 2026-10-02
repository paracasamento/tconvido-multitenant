export const EVENT_TYPES = [
  "wedding",
  "kids_birthday",
  "quinceanera",
  "baby_shower",
  "housewarming",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_CAPABILITIES = [
  "hero",
  "message",
  "date",
  "location",
  "schedule",
  "dress_code",
  "rsvp",
  "gifts",
  "countdown",
  "calendar",
  "important_info",
  "gallery",
] as const;

export type EventCapability = (typeof EVENT_CAPABILITIES)[number];

export type EventTypeDefinition = {
  type: EventType;
  label: string;
  identityLabel: string;
  defaultCapabilities: EventCapability[];
  optionalCapabilities: EventCapability[];
};

export const EVENT_TYPE_DEFINITIONS: Record<EventType, EventTypeDefinition> = {
  wedding: {
    type: "wedding",
    label: "Casamento",
    identityLabel: "Nome dos noivos",
    defaultCapabilities: ["hero", "message", "date", "location", "dress_code", "rsvp", "important_info"],
    optionalCapabilities: ["schedule", "gifts", "countdown", "calendar", "gallery"],
  },
  kids_birthday: {
    type: "kids_birthday",
    label: "Aniversário infantil",
    identityLabel: "Nome da criança",
    defaultCapabilities: ["hero", "message", "date", "location", "rsvp", "important_info"],
    optionalCapabilities: ["schedule", "gifts", "countdown", "calendar", "gallery", "dress_code"],
  },
  quinceanera: {
    type: "quinceanera",
    label: "15 anos",
    identityLabel: "Nome da debutante",
    defaultCapabilities: ["hero", "message", "date", "location", "dress_code", "rsvp", "schedule"],
    optionalCapabilities: ["gifts", "countdown", "calendar", "important_info", "gallery"],
  },
  baby_shower: {
    type: "baby_shower",
    label: "Chá de bebê",
    identityLabel: "Nome do bebê",
    defaultCapabilities: ["hero", "message", "date", "location", "rsvp", "gifts", "important_info"],
    optionalCapabilities: ["schedule", "dress_code", "countdown", "calendar", "gallery"],
  },
  housewarming: {
    type: "housewarming",
    label: "Chá de casa nova",
    identityLabel: "Nome dos anfitriões",
    defaultCapabilities: ["hero", "message", "date", "location", "rsvp", "gifts"],
    optionalCapabilities: ["schedule", "dress_code", "countdown", "calendar", "important_info", "gallery"],
  },
};

export function isEventType(value: string): value is EventType {
  return EVENT_TYPES.includes(value as EventType);
}

export function getEventTypeDefinition(type: EventType) {
  return EVENT_TYPE_DEFINITIONS[type];
}

export function getDefaultCapabilities(type: EventType) {
  return [...EVENT_TYPE_DEFINITIONS[type].defaultCapabilities];
}
