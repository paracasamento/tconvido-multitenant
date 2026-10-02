"use client";

import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import type { InvitePartStyle } from "@/lib/invite-builder";
import { partStyleFromConfig } from "@/components/invite/renderer/visual-style";
import styles from "./RsvpFlowView.module.css";

export type RsvpPreviewState =
  | "children-question"
  | "form-no-children"
  | "form-children"
  | "confirmed"
  | "error";

export type CurrentRsvpSubmission = {
  id: string;
  submitted_name: string;
  adults_count: number;
  has_children: boolean;
  children_count: number;
};

type Props = {
  parts?: Record<string, InvitePartStyle>;
  scenarioParts?: Record<string, Record<string, InvitePartStyle>>;
  initialSubmission?: CurrentRsvpSubmission | null;
  identityName?: string;
  maxAdults?: number;
  allowChildren?: boolean;
  maxChildren?: number;
  preview?: boolean;
  previewState?: RsvpPreviewState;
  selectedPart?: string | null;
  onPartSelect?: (partId: string) => void;
  controlledState?: RsvpPreviewState;
  onStateChange?: (state: RsvpPreviewState) => void;
};

export function RsvpFlowView({
  parts = {},
  scenarioParts = {},
  initialSubmission = null,
  identityName = "",
  maxAdults = 1,
  allowChildren = true,
  maxChildren = 20,
  preview = false,
  previewState = "children-question",
  selectedPart = null,
  onPartSelect,
  controlledState,
  onStateChange,
}: Props) {
  const [step, setStep] = useState<RsvpPreviewState>(
    preview
      ? previewState
      : initialSubmission
        ? "confirmed"
        : allowChildren ? "children-question" : "form-no-children"
  );
  const [name, setName] = useState(initialSubmission?.submitted_name || identityName || "");
  const [adultsCount, setAdultsCount] = useState(
    Math.max(1, Math.min(Math.max(1, maxAdults), initialSubmission?.adults_count || 1))
  );
  const [hasChildren, setHasChildren] = useState(initialSubmission?.has_children || false);
  const [childrenCount, setChildrenCount] = useState(
    Math.max(1, Math.min(Math.max(1, maxChildren), initialSubmission?.children_count || 1))
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const activeStep = preview ? previewState : (controlledState ?? step);
  const previewAdults = Math.min(2, Math.max(1, maxAdults));
  const previewChildren = Math.min(2, Math.max(1, maxChildren));

  function go(next: RsvpPreviewState) {
    setStep(next);
    onStateChange?.(next);
  }

  const partFor = (id: string): InvitePartStyle => ({
    ...(parts[id] || {}),
    ...(scenarioParts[activeStep]?.[id] || {}),
  });

  const t = (id: string, fallback: string) => partFor(id).text || fallback;

  const bind = (id: string) => ({
    "data-part": id,
    "data-editor-part-selected": preview && selectedPart === id ? "true" : undefined,
    style: partStyleFromConfig(partFor(id)),
    onClick: preview
      ? (event: React.MouseEvent) => {
          event.stopPropagation();
          onPartSelect?.(id);
        }
      : undefined,
  });

  function chooseChildren(value: boolean) {
    if (preview) return;
    setHasChildren(value);
    setError("");
    go(value ? "form-children" : "form-no-children");
  }

  function changeAdults(delta: number) {
    if (preview) return;
    setAdultsCount(current => Math.max(1, Math.min(Math.max(1, maxAdults), current + delta)));
  }

  function changeChildren(delta: number) {
    if (preview) return;
    setChildrenCount(current => Math.max(1, Math.min(Math.max(1, maxChildren), current + delta)));
  }

  async function confirmPresence() {
    if (preview || busy) return;

    if (name.trim().length < 2) {
      setError("Informe seu nome e sobrenome.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/me/rsvp", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          submitted_name: name.trim(),
          adults_count: adultsCount,
          has_children: allowChildren ? hasChildren : false,
          children_count: allowChildren && hasChildren ? childrenCount : 0,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data.message || "Não foi possível salvar sua confirmação agora.";

        if (response.status === 400) {
          setError(message);
          return;
        }

        if (response.status === 401) {
          window.location.assign("/acesso");
          return;
        }

        setError(message);
        go("error");
        return;
      }

      setError("");
      go("confirmed");
    } catch {
      setError("Não foi possível salvar sua confirmação agora.");
      go("error");
    } finally {
      setBusy(false);
    }
  }

  const summaryAdults = preview ? previewAdults : adultsCount;
  const summaryChildren =
    allowChildren && (hasChildren || (preview && previewState === "confirmed"))
      ? (preview ? previewChildren : childrenCount)
      : 0;
  const hasGroupSummary = summaryAdults > 1 || summaryChildren > 0;
  const groupSummary = [
    `${summaryAdults} ${summaryAdults === 1 ? "adulto" : "adultos"}`,
    summaryChildren > 0
      ? `${summaryChildren} ${summaryChildren === 1 ? "criança" : "crianças"}`
      : "",
  ].filter(Boolean).join(" + ");

  return (
    <section className={styles.flow} data-rsvp-scenario={activeStep} {...bind("flow")}>
      {activeStep === "children-question" && (
        <div className={styles.stack}>
          <span {...bind("step-label")}>{t("step-label", "CONFIRMAR PRESENÇA")}</span>
          <h2 {...bind("question-title")}>{t("question-title", "Alguma criança irá com você?")}</h2>

          <div className={styles.choiceGrid}>
            <button
              type="button"
              {...bind("yes-button")}
              onClick={preview ? bind("yes-button").onClick : () => chooseChildren(true)}
            >
              <span {...bind("yes-text")}>{t("yes-text", "SIM")}</span>
            </button>

            <button
              type="button"
              {...bind("no-button")}
              onClick={preview ? bind("no-button").onClick : () => chooseChildren(false)}
            >
              <span {...bind("no-text")}>{t("no-text", "NÃO")}</span>
            </button>
          </div>
        </div>
      )}

      {(activeStep === "form-no-children" || activeStep === "form-children") && (
        <div className={styles.stack}>
          <span {...bind("step-label")}>{t("step-label", "CONFIRMAR PRESENÇA")}</span>
          <h2 {...bind("form-title")}>{t("form-title", "Confirme sua presença")}</h2>

          <label className={styles.fieldGroup}>
            <span {...bind("name-label")}>{t("name-label", "Nome e sobrenome")}</span>
            <input
              {...bind("name-input")}
              value={preview ? "Convidado" : name}
              onChange={event => !preview && !identityName && setName(event.target.value)}
              placeholder={t("name-input", "Seu nome")}
              autoComplete="name"
              readOnly={!preview && Boolean(identityName)}
            />
          </label>

          {maxAdults > 1 && (
            <div className={styles.childrenBlock}>
              <span {...bind("adults-label")}>{t("adults-label", "Quantidade de adultos")}</span>
              <div {...bind("adults-stepper")} className={styles.stepper}>
                <button
                  type="button"
                  {...bind("adults-stepper-button")}
                  onClick={preview ? bind("adults-stepper-button").onClick : () => changeAdults(-1)}
                >
                  <Minus size={17} />
                </button>

                <strong {...bind("adults-stepper-value")}>
                  {preview ? previewAdults : adultsCount}
                </strong>

                <button
                  type="button"
                  {...bind("adults-stepper-button")}
                  onClick={preview ? bind("adults-stepper-button").onClick : () => changeAdults(1)}
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>
          )}

          {activeStep === "form-children" && allowChildren && (
            <div className={styles.childrenBlock}>
              <span {...bind("children-label")}>{t("children-label", "Quantidade de crianças")}</span>
              <div {...bind("stepper")} className={styles.stepper}>
                <button
                  type="button"
                  {...bind("stepper-button")}
                  onClick={preview ? bind("stepper-button").onClick : () => changeChildren(-1)}
                >
                  <Minus size={17} />
                </button>

                <strong {...bind("stepper-value")}>
                  {preview ? previewChildren : childrenCount}
                </strong>

                <button
                  type="button"
                  {...bind("stepper-button")}
                  onClick={preview ? bind("stepper-button").onClick : () => changeChildren(1)}
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            {...bind("confirm-button")}
            onClick={preview ? bind("confirm-button").onClick : confirmPresence}
            disabled={!preview && busy}
          >
            <span {...bind("confirm-text")}>
              {busy ? "CONFIRMANDO..." : t("confirm-text", "CONFIRMAR PRESENÇA")}
            </span>
          </button>

          {!preview && error && <p className={styles.inlineError}>{error}</p>}
        </div>
      )}

      {activeStep === "confirmed" && (
        <div className={styles.statusStack}>
          <div {...bind("success-icon")} className={styles.successIcon}>
            <Check size={26} />
          </div>
          <h2 {...bind("success-title")}>{t("success-title", "Presença confirmada")}</h2>
          {hasGroupSummary ? (
            <p {...bind("success-copy-group")}>
              {t("success-copy-group", `Confirmação registrada para ${groupSummary}.`)}
            </p>
          ) : (
            <p {...bind("success-copy")}>
              {t("success-copy", "Obrigado por confirmar. Esperamos você!")}
            </p>
          )}
        </div>
      )}

      {activeStep === "error" && (
        <div className={styles.statusStack} {...bind("error-card")}>
          <h2 {...bind("error-title")}>{t("error-title", "Não foi possível confirmar agora")}</h2>
          <p {...bind("error-copy")}>
            {t("error-copy", "Tente novamente em alguns instantes.")}
          </p>
          <button
            type="button"
            {...bind("retry-button")}
            onClick={preview ? bind("retry-button").onClick : () => {
              setError("");
              go(allowChildren && hasChildren ? "form-children" : "form-no-children");
            }}
          >
            <span {...bind("retry-text")}>{t("retry-text", "TENTAR NOVAMENTE")}</span>
          </button>
        </div>
      )}
    </section>
  );
}
