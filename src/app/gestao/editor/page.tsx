import { InviteVisualBuilder } from "@/components/admin/invite-builder/InviteVisualBuilder";
import { defaultInviteVisualConfig } from "@/lib/invite-builder";
import { getInviteVisualConfig } from "@/lib/invite-builder-server";
import { getInviteEditorPreviewData } from "@/lib/invite-editor-preview";
import { requireOwner } from "@/lib/sessions";
import { getThemeLibrary } from "@/lib/theme-library-server";
import { db } from "@/lib/db";
import { getEventCapabilities } from "@/lib/event-capabilities";

export default async function GestaoInviteEditorPage() {
  const session = await requireOwner("/gestao/editor");
  const [eventRows, capabilities, config, previewData, themeLibrary] = await Promise.all([
    db()`SELECT event_type,event_name,couple_names FROM events WHERE id=${session.event_id} LIMIT 1`,
    getEventCapabilities(session.event_id),
    getInviteVisualConfig(session.event_id),
    getInviteEditorPreviewData(session.event_id),
    getThemeLibrary(),
  ]);
  const event:any=eventRows[0];

  return (
    <InviteVisualBuilder
      initial={config}
      defaults={defaultInviteVisualConfig}
      previewData={previewData}
      themeLibrary={themeLibrary}
      eventContext={{type:event?.event_type||"wedding",name:event?.event_name||event?.couple_names||"Evento",capabilities}}
    />
  );
}
