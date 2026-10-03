import { z } from "zod";
import { EVENT_TYPES } from "@/lib/event-types";

export const intakeSchema = z.object({
  event_type: z.enum(EVENT_TYPES),
  contact_name: z.string().trim().min(2).max(120),
  whatsapp: z.string().trim().min(8).max(30),
  email: z.union([z.string().trim().email().max(200), z.literal("")]).optional().default(""),
  event_date_defined: z.boolean(),
  event_date: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal(""), z.null()]).optional().default("").transform(value => value ?? ""),
  event_time: z.union([z.string().regex(/^\d{2}:\d{2}$/), z.literal(""), z.null()]).optional().default("").transform(value => value ?? ""),
  identity: z.string().trim().min(1).max(180),
  age: z.union([z.number().int().min(1).max(120), z.null()]).optional(),
  location_defined: z.boolean().default(false),
  venue: z.string().trim().max(180).optional().default(""),
  address: z.string().trim().max(300).optional().default(""),
  city: z.string().trim().max(180).optional().default(""),
  maps_url: z.union([z.string().trim().url().max(1200), z.literal("")]).optional().default(""),
  rsvp_wanted: z.boolean().default(true),
  gifts_wanted: z.boolean().default(false),
  dress_code_wanted: z.boolean().default(false),
  schedule_wanted: z.boolean().default(false),
  important_info: z.string().trim().max(3000).optional().default(""),
  required_message: z.string().trim().max(3000).optional().default(""),
  decoration_status: z.enum(["defined", "partial", "undefined"]).default("undefined"),
  decoration_notes: z.string().trim().max(3000).optional().default(""),
  style_tags: z.array(z.string().trim().min(1).max(50)).max(3).default([]),
  color_notes: z.string().trim().max(500).optional().default(""),
  style_notes: z.string().trim().max(3000).optional().default(""),
  wedding_hosting: z.enum(["couple","parents","couple_and_parents"]).optional(),
  bride_parents: z.string().trim().max(300).optional().default(""),
  groom_parents: z.string().trim().max(300).optional().default(""),
  wedding_venues: z.enum(["same","different","undefined"]).optional(),
  reception_venue: z.string().trim().max(180).optional().default(""),
  reception_address: z.string().trim().max(300).optional().default(""),
  reception_city: z.string().trim().max(180).optional().default(""),
  special_text_choice: z.enum(["yes","no","later"]).optional(),
  special_text: z.string().trim().max(3000).optional().default(""),
  selected_colors: z.array(z.string().trim().min(1).max(30)).max(5).optional().default([]),
  invite_photo_choice: z.enum(["yes","no","later"]).optional().default("later"),
  invite_photo_drive_url: z.union([z.string().trim().url().max(1200), z.literal("")]).optional().default(""),
  event_specific: z.record(z.string(), z.unknown()).optional().default({}),
}).superRefine((value, ctx) => {
  if (value.event_type === "wedding" && !value.wedding_hosting) ctx.addIssue({ code: "custom", path: ["wedding_hosting"], message: "Escolha quem convida para o casamento." });
  if (value.event_type === "wedding" && (value.wedding_hosting === "parents" || value.wedding_hosting === "couple_and_parents") && (!value.bride_parents || !value.groom_parents)) ctx.addIssue({ code: "custom", path: ["bride_parents"], message: "Informe os nomes dos pais das duas famílias." });
  if (value.event_date_defined && !value.event_date) {
    ctx.addIssue({ code: "custom", path: ["event_date"], message: "Informe a data do evento." });
  }
});

export type IntakeInput = z.infer<typeof intakeSchema>;

export function buildIntakePendingItems(value: IntakeInput) {
  const pending: string[] = [];
  if (!value.event_date_defined) pending.push("event_date");
  if (!value.event_time) pending.push("event_time");
  if (!value.location_defined || !value.venue) pending.push("location");
  return pending;
}
