import Link from "next/link";
import { ApplyInvitationModelButton } from "@/components/gestao/ApplyInvitationModelButton";
import {
  INVITE_COMPONENT_PRESETS,
  INVITE_COMPONENT_PRESET_CATEGORIES,
} from "@/lib/component-presets";
import { db } from "@/lib/db";
import {
  INVITATION_MODELS,
} from "@/lib/invitation-models";
import {
  EVENT_TYPE_DEFINITIONS,
  isEventType,
  type EventType,
} from "@/lib/event-types";
import { requirePlatformAdmin } from "@/lib/sessions";

const typeNames: Record<string, string> = {
  wedding: "Casamento",
  kids_birthday: "Aniversário infantil",
  quinceanera: "15 anos",
  baby_shower: "Chá de bebê",
  housewarming: "Casa nova",
};

export default async function ModelsPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  await requirePlatformAdmin("/gestao/modelos");
  const params = await searchParams;
  const eventId = String(params.event || "").trim();

  let selectedEvent: {
    id: string;
    event_type: EventType;
    name: string;
  } | null = null;

  if (eventId) {
    const rows = await db()`
      SELECT
        id,
        event_type,
        COALESCE(
          event_name,
          celebrant_name,
          baby_name,
          hosts_names,
          couple_names,
          title
        ) AS event_name
      FROM events
      WHERE id = ${eventId}
      LIMIT 1
    `;

    const row = rows[0] as any;
    if (row && isEventType(String(row.event_type || ""))) {
      selectedEvent = {
        id: String(row.id),
        event_type: row.event_type as EventType,
        name: String(row.event_name || "Evento"),
      };
    }
  }

  return (
    <main className="gestao-home">
      <section className="gestao-hero">
        <p className="gestao-kicker">Biblioteca estrutural</p>
        <h1>Modelos</h1>
        <p>
          Modelos completos definem a composição das telas do convite. Componentes
          continuam disponíveis separadamente para ajustes pontuais no editor.
        </p>
        {selectedEvent && (
          <div className="card-actions">
            <Link
              href={`/gestao/eventos/${selectedEvent.id}`}
              className="button button--ghost"
            >
              ← {selectedEvent.name}
            </Link>
            <span className="muted">
              {EVENT_TYPE_DEFINITIONS[selectedEvent.event_type].label}
            </span>
          </div>
        )}
      </section>

      <section className="settings-card">
        <h2>Modelos completos</h2>
        <p className="muted">
          Ao aplicar um modelo, somente o design visual é substituído. Dados do
          evento, convidados, confirmações e presentes permanecem intactos.
        </p>

        <div className="gestao-event-list">
          {INVITATION_MODELS.map(model => {
            const compatible =
              !selectedEvent ||
              model.eventTypes.includes(selectedEvent.event_type);

            return (
              <article className="gestao-event-card" key={model.id}>
                <div className="gestao-event-card__title">
                  <div
                    aria-label={`Paleta do modelo ${model.name}`}
                    style={{
                      display: "flex",
                      gap: 5,
                      marginBottom: 10,
                    }}
                  >
                    {[
                      model.palette.background,
                      model.palette.primary,
                      model.palette.accent,
                      model.palette.surface,
                    ].map((color, index) => (
                      <i
                        key={index}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 999,
                          background: color,
                          border: "1px solid rgba(0,0,0,.12)",
                        }}
                      />
                    ))}
                  </div>

                  <h3>{model.name}</h3>
                  <p>{model.description}</p>
                  <small>
                    {model.eventTypes
                      .map(type => typeNames[type] || type)
                      .join(" · ")}
                  </small>
                </div>

                {selectedEvent && compatible && (
                  <ApplyInvitationModelButton
                    eventId={selectedEvent.id}
                    modelId={model.id}
                    modelName={model.name}
                  />
                )}

                {selectedEvent && !compatible && (
                  <small className="muted">
                    Não indicado para este tipo de evento.
                  </small>
                )}
              </article>
            );
          })}
        </div>

        {!selectedEvent && (
          <p className="muted">
            Abra esta biblioteca pelo workspace de um evento para aplicar um
            modelo diretamente.
          </p>
        )}
      </section>

      {INVITE_COMPONENT_PRESET_CATEGORIES.map(category => {
        const items = INVITE_COMPONENT_PRESETS.filter(
          preset => preset.category === category.id
        );

        return (
          <section className="settings-card" key={category.id}>
            <h2>{category.label}</h2>
            <div className="gestao-event-list">
              {items.map(preset => (
                <article className="gestao-event-card" key={preset.id}>
                  <div className="gestao-event-card__title">
                    <h3>{preset.name}</h3>
                    <p>{preset.description}</p>
                    <small>
                      {preset.eventTypes?.length
                        ? preset.eventTypes
                            .map(type => typeNames[type] || type)
                            .join(" · ")
                        : "Todos os eventos"}
                      {preset.capabilities?.length
                        ? " · " + preset.capabilities.join(", ")
                        : ""}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
