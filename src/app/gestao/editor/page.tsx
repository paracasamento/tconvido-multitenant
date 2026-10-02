import { InviteVisualBuilder } from "@/components/admin/invite-builder/InviteVisualBuilder";
import { defaultInviteVisualConfig } from "@/lib/invite-builder";
import { getInviteVisualConfig } from "@/lib/invite-builder-server";
import { getInviteEditorPreviewData } from "@/lib/invite-editor-preview";
import { requireOwner } from "@/lib/sessions";
import { getThemeLibrary } from "@/lib/theme-library-server";
import { db } from "@/lib/db";

export default async function GestaoInviteEditorPage() {
  const session = await requireOwner("/gestao/editor");
  const eventRows=await db()`SELECT event_type,event_name,couple_names,enabled_capabilities FROM events WHERE id=${session.event_id} LIMIT 1`;
  const event:any=eventRows[0];
  const [config, previewData, themeLibrary] = await Promise.all([
    getInviteVisualConfig(session.event_id),
    getInviteEditorPreviewData(session.event_id),
    getThemeLibrary(),
  ]);

  return (
    <InviteVisualBuilder
      initial={config}
      defaults={defaultInviteVisualConfig}
      previewData={previewData}
      themeLibrary={themeLibrary}
      eventContext={{type:event?.event_type||"wedding",name:event?.event_name||event?.couple_names||"Evento",capabilities:Array.isArray(event?.enabled_capabilities)?event.enabled_capabilities:[]}}
    />
  );
}
