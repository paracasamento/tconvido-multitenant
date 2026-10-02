"use client";

import { useMemo, useState } from "react";
import { EVENT_TYPE_DEFINITIONS, type EventType } from "@/lib/event-types";

const styles = ["Clássico", "Romântico", "Minimalista", "Moderno", "Delicado", "Divertido", "Rústico/Natural", "Luxuoso"];

export function PublicIntakeForm() {
  const [eventType, setEventType] = useState<EventType | "">("");
  const [dateDefined, setDateDefined] = useState(true);
  const [locationDefined, setLocationDefined] = useState(true);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  const definition = useMemo(() => eventType ? EVENT_TYPE_DEFINITIONS[eventType] : null, [eventType]);

  function toggleStyle(value: string) {
    setStyleTags(current => current.includes(value) ? current.filter(item => item !== value) : current.length < 3 ? [...current, value] : current);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = {
      event_type: eventType,
      contact_name: form.get("contact_name"),
      whatsapp: form.get("whatsapp"),
      email: form.get("email"),
      event_date_defined: dateDefined,
      event_date: dateDefined ? form.get("event_date") : "",
      event_time: form.get("event_time"),
      identity: form.get("identity"),
      age: form.get("age") ? Number(form.get("age")) : null,
      location_defined: locationDefined,
      venue: locationDefined ? form.get("venue") : "",
      address: locationDefined ? form.get("address") : "",
      city: locationDefined ? form.get("city") : "",
      maps_url: locationDefined ? form.get("maps_url") : "",
      rsvp_wanted: form.get("rsvp_wanted") === "on",
      gifts_wanted: form.get("gifts_wanted") === "on",
      dress_code_wanted: form.get("dress_code_wanted") === "on",
      schedule_wanted: form.get("schedule_wanted") === "on",
      important_info: form.get("important_info"),
      required_message: form.get("required_message"),
      decoration_status: form.get("decoration_status"),
      decoration_notes: form.get("decoration_notes"),
      style_tags: styleTags,
      color_notes: form.get("color_notes"),
      style_notes: form.get("style_notes"),
    };

    try {
      const response = await fetch("/api/public/intakes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Não foi possível enviar sua ficha.");
      setDone(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível enviar sua ficha.");
    } finally {
      setBusy(false);
    }
  }

  if (done) return <main className="intake-shell"><section className="intake-card intake-success"><span>✓</span><h1>Ficha enviada!</h1><p>Recebemos as informações do seu convite. Entraremos em contato pelo WhatsApp informado antes de iniciar a produção.</p></section></main>;

  return <main className="intake-shell">
    <header className="intake-hero"><p className="eyebrow">TConvido</p><h1>Ficha do seu convite</h1><p>Conte sobre o seu evento para prepararmos um convite em site feito para ele.</p></header>
    <form className="intake-card" onSubmit={submit}>
      <section className="intake-section">
        <span className="intake-step">01</span><h2>Qual é o seu evento?</h2>
        <div className="intake-type-grid">
          {(Object.values(EVENT_TYPE_DEFINITIONS)).map(item => <button key={item.type} type="button" className={eventType === item.type ? "is-selected" : ""} onClick={() => setEventType(item.type)}>{item.label}</button>)}
        </div>
      </section>

      {definition && <>
        <section className="intake-section">
          <span className="intake-step">02</span><h2>Sobre o evento</h2>
          <label><span>{definition.identityLabel}</span><input name="identity" required placeholder={definition.type === "wedding" ? "Ana & João" : ""} /></label>
          {(eventType === "kids_birthday" || eventType === "quinceanera") && <label><span>Idade</span><input name="age" type="number" min="1" max="120" /></label>}
          <div className="intake-choice"><span>Você já tem a data definida?</span><button type="button" className={dateDefined ? "is-selected" : ""} onClick={() => setDateDefined(true)}>Sim</button><button type="button" className={!dateDefined ? "is-selected" : ""} onClick={() => setDateDefined(false)}>Ainda não</button></div>
          {dateDefined && <label><span>Data</span><input name="event_date" type="date" required /></label>}
          <label><span>Horário <small>pode deixar em branco se ainda não souber</small></span><input name="event_time" type="time" /></label>
        </section>

        <section className="intake-section">
          <span className="intake-step">03</span><h2>Local</h2>
          <div className="intake-choice"><span>O local já está definido?</span><button type="button" className={locationDefined ? "is-selected" : ""} onClick={() => setLocationDefined(true)}>Sim</button><button type="button" className={!locationDefined ? "is-selected" : ""} onClick={() => setLocationDefined(false)}>Ainda não</button></div>
          {locationDefined && <div className="intake-fields"><label><span>Nome do local</span><input name="venue" /></label><label><span>Endereço</span><input name="address" /></label><label><span>Cidade</span><input name="city" /></label><label><span>Link do Maps</span><input name="maps_url" type="url" /></label></div>}
        </section>

        <section className="intake-section">
          <span className="intake-step">04</span><h2>O que o convite precisa ter?</h2>
          <div className="intake-switches"><label><input name="rsvp_wanted" type="checkbox" defaultChecked /><span>Confirmação de presença</span></label><label><input name="gifts_wanted" type="checkbox" /><span>Presentes</span></label><label><input name="dress_code_wanted" type="checkbox" /><span>Traje / dress code</span></label><label><input name="schedule_wanted" type="checkbox" /><span>Programação</span></label></div>
          <label><span>Informações importantes aos convidados</span><textarea name="important_info" placeholder="Estacionamento, crianças, piscina, horário de chegada..." /></label>
          <label><span>Alguma frase ou mensagem que precisa aparecer?</span><textarea name="required_message" placeholder="Pode deixar em branco e deixar por nossa conta." /></label>
        </section>

        <section className="intake-section">
          <span className="intake-step">05</span><h2>Estilo e referências</h2>
          <label><span>A decoração está definida?</span><select name="decoration_status" defaultValue="undefined"><option value="defined">Sim</option><option value="partial">Parcialmente</option><option value="undefined">Ainda não</option></select></label>
          <label><span>Conte um pouco sobre a decoração</span><textarea name="decoration_notes" /></label>
          <div><span className="intake-label">Escolha até 3 estilos</span><div className="intake-tags">{styles.map(style => <button key={style} type="button" className={styleTags.includes(style) ? "is-selected" : ""} onClick={() => toggleStyle(style)}>{style}</button>)}</div></div>
          <label><span>Cores que gostaria que fossem consideradas</span><input name="color_notes" placeholder="Verde oliva, off-white, dourado..." /></label>
          <label><span>Mais alguma direção de estilo?</span><textarea name="style_notes" /></label>
          <div className="intake-media-placeholder"><strong>Referências visuais</strong><p>O envio de fotos da decoração e referências será conectado aqui na próxima etapa da implantação.</p></div>
        </section>

        <section className="intake-section">
          <span className="intake-step">06</span><h2>Como falamos com você?</h2>
          <label><span>Seu nome</span><input name="contact_name" required /></label>
          <label><span>WhatsApp</span><input name="whatsapp" type="tel" required placeholder="(42) 99999-9999" /></label>
          <label><span>E-mail <small>opcional</small></span><input name="email" type="email" /></label>
          <p className="intake-consent">Ao enviar, você autoriza nosso contato pelo WhatsApp informado sobre esta solicitação de convite.</p>
        </section>

        {message && <p className="form-error">{message}</p>}
        <button className="button button--primary intake-submit" disabled={busy}>{busy ? "Enviando..." : "Enviar minha ficha"}</button>
      </>}
    </form>
  </main>;
}
