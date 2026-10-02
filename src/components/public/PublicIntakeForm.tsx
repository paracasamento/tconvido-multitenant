"use client";

import { useEffect, useMemo, useState } from "react";
import { EVENT_TYPE_DEFINITIONS, type EventType } from "@/lib/event-types";

const styles = ["Clássico", "Romântico", "Minimalista", "Moderno", "Delicado", "Divertido", "Rústico/Natural", "Luxuoso"];

export function PublicIntakeForm({ resume }: { resume?: { id: string; token: string } }) {
  const [eventType, setEventType] = useState<EventType | "">("");
  const [dateDefined, setDateDefined] = useState(true);
  const [locationDefined, setLocationDefined] = useState(true);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [resumeLoaded, setResumeLoaded] = useState(!resume);
  const [locked, setLocked] = useState(false);
  const [initial, setInitial] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [weddingHosting, setWeddingHosting] = useState("couple");
  const [weddingVenues, setWeddingVenues] = useState("same");
  const [specialTextChoice, setSpecialTextChoice] = useState("later");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [featureDefaults, setFeatureDefaults] = useState({ rsvp: true, gifts: false, dress_code: false, schedule: false });
  const definition = useMemo(() => eventType ? EVENT_TYPE_DEFINITIONS[eventType] : null, [eventType]);

  useEffect(() => { if (!resume) return; fetch(`/api/public/intakes/${resume.id}?token=${encodeURIComponent(resume.token)}`).then(async r => { const d=await r.json(); if(!r.ok) throw new Error(d.message||"Não foi possível abrir a ficha."); setInitial(d); setEventType(d.event_type); setFeatureDefaults({ rsvp:Boolean(d.answers?.rsvp_wanted), gifts:Boolean(d.answers?.gifts_wanted), dress_code:Boolean(d.answers?.dress_code_wanted), schedule:Boolean(d.answers?.schedule_wanted) }); setDateDefined(d.event_date_defined); setLocationDefined(Boolean(d.answers?.location_defined)); setStyleTags(d.visual_direction?.style_tags||[]); setLocked(Boolean(d.locked)); }).catch(e=>setMessage(e.message)).finally(()=>setResumeLoaded(true)); }, [resume]);

  function chooseEventType(type: EventType) {
    setEventType(type);
    if (!resume) {
      const defaults = EVENT_TYPE_DEFINITIONS[type].defaultCapabilities;
      setFeatureDefaults({ rsvp: defaults.includes("rsvp"), gifts: defaults.includes("gifts"), dress_code: defaults.includes("dress_code"), schedule: defaults.includes("schedule") });
    }
  }

  function toggleStyle(value: string) {
    setStyleTags(current => current.includes(value) ? current.filter(item => item !== value) : current.length < 3 ? [...current, value] : current);
  }

  function toggleColor(value:string){setSelectedColors(c=>c.includes(value)?c.filter(x=>x!==value):c.length<5?[...c,value]:c)}
  const colorOptions=[["off-white","#F4F0E8"],["verde oliva","#7C8061"],["azul","#8295AE"],["rosa antigo","#C8A0A5"],["terracota","#B86F52"],["vinho","#73343D"],["dourado","#C5A35A"],["preto","#242424"]];

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
      wedding_hosting: eventType === "wedding" ? weddingHosting : undefined,
      bride_parents: form.get("bride_parents") || "", groom_parents: form.get("groom_parents") || "",
      wedding_venues: eventType === "wedding" ? weddingVenues : undefined,
      reception_venue: form.get("reception_venue") || "", reception_address: form.get("reception_address") || "", reception_city: form.get("reception_city") || "",
      special_text_choice: eventType === "wedding" ? specialTextChoice : undefined,
      special_text: form.get("special_text") || "", selected_colors: selectedColors,
    };

    try {
      const response = await fetch(resume ? `/api/public/intakes/${resume.id}` : "/api/public/intakes", { method: resume ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(resume ? { access_token: resume.token, data: payload } : payload) });
      const raw = await response.text(); const data = raw ? JSON.parse(raw) : {};
      if (!response.ok) throw new Error(data.message || "Não foi possível enviar sua ficha.");
      if (referenceFiles.length && !resume) {
        const media = new FormData();
        media.set("access_token", data.access_token);
        referenceFiles.forEach(file => media.append("files", file));
        const mediaResponse = await fetch(`/api/public/intakes/${data.intake_id}/media`, { method: "POST", body: media });
        const mediaData = await mediaResponse.json();
        if (!mediaResponse.ok) throw new Error(`A ficha foi salva, mas houve um problema com as referências: ${mediaData.message || "tente novamente."}`);
      }
      if (!resume) { localStorage.setItem("tconvido:last-intake", JSON.stringify({ id: data.intake_id, token: data.access_token })); }
      setDone(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível enviar sua ficha.");
    } finally {
      setBusy(false);
    }
  }

  if (!resumeLoaded) return <main className="intake-shell"><section className="intake-card"><p>Carregando sua ficha...</p></section></main>;
  if (done) return <main className="intake-shell"><section className="intake-card intake-success"><span>✓</span><h1>Ficha enviada!</h1><p>Recebemos as informações do seu convite. Entraremos em contato pelo WhatsApp informado antes de iniciar a produção.</p></section></main>;

  return <main className="intake-shell">
    <header className="intake-hero"><p className="eyebrow">TConvido</p><h1>Vamos criar o convite com a cara do seu evento?</h1><p>Responda só o que você já sabe. O que ainda não estiver decidido pode ficar para depois.</p></header>
    <form className="intake-card intake-guided" onSubmit={submit} key={`${initial?.id || "new"}-${eventType}` }>
      <section className="intake-section">
        <span className="intake-step">01</span><h2>Qual é o seu evento?</h2>
        <div className="intake-type-grid">
          {(Object.values(EVENT_TYPE_DEFINITIONS)).map(item => <button key={item.type} type="button" className={eventType === item.type ? "is-selected" : ""} disabled={locked} onClick={() => chooseEventType(item.type)}>{item.label}</button>)}
        </div>
      </section>

      {definition && <>
        <section className="intake-section">
          <span className="intake-step">02</span><h2>Sobre o evento</h2>
          <p className="intake-required-note"><strong>Obrigatório</strong> para identificarmos seu convite.</p><label><span>{definition.identityLabel} <b>Obrigatório</b></span><input name="identity" required defaultValue={initial?.answers?.identity || ""} disabled={locked} placeholder={definition.type === "wedding" ? "Ana & João" : ""} /></label>
          {eventType === "wedding" && <div className="wedding-brief"><div className="intake-choice"><span>Quem convida para o casamento? <b>Obrigatório</b></span>{[["couple","Nós, os noivos"],["parents","Nossos pais"],["couple_and_parents","Nós e nossos pais"]].map(([v,l])=><button key={v} type="button" className={weddingHosting===v?"is-selected":""} onClick={()=>setWeddingHosting(v)}>{l}</button>)}</div>{weddingHosting!=="couple"&&<div className="intake-fields"><label><span>Pais da noiva</span><input name="bride_parents" required placeholder="Ex.: Maria e José" /></label><label><span>Pais do noivo</span><input name="groom_parents" required placeholder="Ex.: Ana e Carlos" /></label></div>}</div>}\n                    {(eventType === "kids_birthday" || eventType === "quinceanera") && <label><span>Idade</span><input name="age" type="number" min="1" max="120" defaultValue={initial?.answers?.age ?? ""} disabled={locked} /></label>}
          <div className="intake-choice"><span>Você já tem a data definida?</span><button type="button" className={dateDefined ? "is-selected" : ""} disabled={locked} onClick={() => setDateDefined(true)}>Sim</button><button type="button" className={!dateDefined ? "is-selected" : ""} disabled={locked} onClick={() => setDateDefined(false)}>Ainda não</button></div>
          {dateDefined && <label><span>Data</span><input name="event_date" type="date" required defaultValue={initial?.event_date || ""} disabled={locked} /></label>}
          <label><span>Horário <small>pode deixar em branco se ainda não souber</small></span><input name="event_time" type="time" defaultValue={initial?.event_time || ""} disabled={locked} /></label>
        </section>

        <section className="intake-section">
          <span className="intake-step">03</span><h2>Local</h2>
          <div className="intake-choice"><span>O local já está definido?</span><button type="button" className={locationDefined ? "is-selected" : ""} disabled={locked} onClick={() => setLocationDefined(true)}>Sim</button><button type="button" className={!locationDefined ? "is-selected" : ""} disabled={locked} onClick={() => setLocationDefined(false)}>Ainda não</button></div>
          {eventType==="wedding" && locationDefined && <div className="intake-choice"><span>Cerimônia e recepção serão no mesmo local?</span>{[["same","Sim, no mesmo local"],["different","Locais diferentes"],["undefined","Ainda não sabemos"]].map(([v,l])=><button key={v} type="button" className={weddingVenues===v?"is-selected":""} onClick={()=>setWeddingVenues(v)}>{l}</button>)}</div>}\n          {locationDefined && <div className="intake-fields"><label><span>Nome do local</span><input name="venue" defaultValue={initial?.answers?.venue || ""} disabled={locked} /></label><label><span>Endereço</span><input name="address" defaultValue={initial?.answers?.address || ""} disabled={locked} /></label><label><span>Cidade</span><input name="city" defaultValue={initial?.answers?.city || ""} disabled={locked} /></label><label><span>Link do Maps</span><input name="maps_url" type="url" defaultValue={initial?.answers?.maps_url || ""} disabled={locked} /></label></div>}
        </section>

        <section className="intake-section">
          <span className="intake-step">04</span><h2>O que o convite precisa ter?</h2>
          <div className="intake-switches"><label><input name="rsvp_wanted" type="checkbox" defaultChecked={initial ? Boolean(initial.answers?.rsvp_wanted) : featureDefaults.rsvp} disabled={locked} /><span>Confirmação de presença</span></label><label><input name="gifts_wanted" type="checkbox" defaultChecked={initial ? Boolean(initial.answers?.gifts_wanted) : featureDefaults.gifts} disabled={locked} /><span>Presentes</span></label><label><input name="dress_code_wanted" type="checkbox" defaultChecked={initial ? Boolean(initial.answers?.dress_code_wanted) : featureDefaults.dress_code} disabled={locked} /><span>Traje / dress code</span></label><label><input name="schedule_wanted" type="checkbox" defaultChecked={initial ? Boolean(initial.answers?.schedule_wanted) : featureDefaults.schedule} disabled={locked} /><span>Programação</span></label></div>
          <label><span>Informações importantes aos convidados</span><textarea name="important_info" defaultValue={initial?.answers?.important_info || ""} disabled={locked} placeholder="Estacionamento, crianças, piscina, horário de chegada..." /></label>
          {eventType==="wedding"&&<div className="intake-choice"><span>Quer incluir um versículo, frase ou trecho especial?</span>{[["yes","Quero incluir"],["no","Não"],["later","Ainda não escolhi"]].map(([v,l])=><button key={v} type="button" className={specialTextChoice===v?"is-selected":""} onClick={()=>setSpecialTextChoice(v)}>{l}</button>)}</div>}{eventType==="wedding"&&specialTextChoice==="yes"&&<label><span>Versículo, frase ou trecho</span><textarea name="special_text" placeholder="Escreva aqui exatamente como gostaria que aparecesse." /></label>}\n          <label><span>Alguma outra mensagem que precisa aparecer? <small>opcional</small></span><textarea name="required_message" defaultValue={initial?.answers?.required_message || ""} disabled={locked} placeholder="Pode deixar em branco e deixar por nossa conta." /></label>
        </section>

        <section className="intake-section">
          <span className="intake-step">05</span><h2>Estilo e referências</h2>
          <label><span>A decoração está definida?</span><select name="decoration_status" defaultValue={initial?.visual_direction?.decoration_status || "undefined"} disabled={locked}><option value="defined">Sim</option><option value="partial">Parcialmente</option><option value="undefined">Ainda não</option></select></label>
          <label><span>Conte um pouco sobre a decoração</span><textarea name="decoration_notes" defaultValue={initial?.visual_direction?.decoration_notes || ""} disabled={locked} /></label>
          <div><span className="intake-label">Escolha até 3 estilos</span><div className="intake-tags">{styles.map(style => <button key={style} type="button" className={styleTags.includes(style) ? "is-selected" : ""} disabled={locked} onClick={() => toggleStyle(style)}>{style}</button>)}</div></div>
          <div><span className="intake-label">Quais cores combinam com o evento? <small>Escolha até 5</small></span><div className="intake-colors">{colorOptions.map(([name,color])=><button type="button" key={name} className={selectedColors.includes(name)?"is-selected":""} onClick={()=>toggleColor(name)}><i style={{background:color}}/><span>{name}</span></button>)}</div></div><label><span>Outra cor ou observação <small>opcional</small></span><input name="color_notes" defaultValue={initial?.visual_direction?.color_notes || ""} disabled={locked} placeholder="Ex.: evitar tons muito escuros" /></label>
          <label><span>Mais alguma direção de estilo?</span><textarea name="style_notes" defaultValue={initial?.visual_direction?.style_notes || ""} disabled={locked} /></label>
          <label className="intake-media-placeholder"><strong>Referências visuais</strong><p>Envie até 8 fotos da decoração, paleta, papelaria ou outras referências. JPG, PNG ou WebP, até 12 MB cada.</p><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => setReferenceFiles(Array.from(e.target.files || []).slice(0, 8))} /><small>{referenceFiles.length ? `${referenceFiles.length} imagem(ns) selecionada(s)` : "Nenhuma imagem selecionada"}</small></label>
        </section>

        <section className="intake-section">
          <span className="intake-step">06</span><h2>Como falamos com você?</h2>
          <label><span>Seu nome</span><input name="contact_name" required defaultValue={initial?.contact_name || ""} disabled={locked} /></label>
          <label><span>WhatsApp</span><input name="whatsapp" type="tel" required defaultValue={initial?.whatsapp || ""} disabled={locked} placeholder="(42) 99999-9999" /></label>
          <label><span>E-mail <small>opcional</small></span><input name="email" type="email" defaultValue={initial?.email || ""} disabled={locked} /></label>
          <p className="intake-consent">Ao enviar, você autoriza nosso contato pelo WhatsApp informado sobre esta solicitação de convite.</p>
        </section>

        {locked && <p className="intake-consent">Esta ficha já entrou em produção. As respostas permanecem disponíveis para consulta.</p>}{message && <p className="form-error">{message}</p>}
        {!locked && <button className="button button--primary intake-submit" disabled={busy}>{busy ? "Salvando..." : resume ? "Salvar alterações" : "Enviar minha ficha"}</button>}
      </>}
    </form>
  </main>;
}
