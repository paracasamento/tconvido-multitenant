"use client";

import Link from "next/link";
import type { InviteElement, InvitePartStyle } from "@/lib/invite-builder";
import { InvitePartIcon } from "@/components/invite/InvitePartIcon";
import { partStyleFromConfig } from "@/components/invite/renderer/visual-style";
import styles from "./InviteStructureBlock.module.css";

function part(parts: Record<string, InvitePartStyle> | undefined, id: string) {
  return partStyleFromConfig(parts?.[id] || {});
}

function text(value: string | undefined) {
  return value || "";
}

function EventDateBlock({
  variant,
  vars,
  parts,
}: {
  variant: string;
  vars: Record<string, string | undefined>;
  parts?: Record<string, InvitePartStyle>;
}) {
  return (
    <div
      data-part="container"
      className={`${styles.dateBlock} ${styles[`date_${variant.replaceAll("-", "_")}`] || ""}`}
      style={part(parts, "container")}
    >
      <span data-part="weekday" className={styles.weekday} style={part(parts, "weekday")}>
        {text(vars.weekday)}
      </span>
      <div data-part="date-row" className={styles.dateRow} style={part(parts, "date-row")}>
        <span data-part="month" className={styles.month} style={part(parts, "month")}>
          {text(vars.month)}
        </span>
        <span data-part="day" className={styles.day} style={part(parts, "day")}>
          {text(vars.day)}
        </span>
        <span data-part="year" className={styles.year} style={part(parts, "year")}>
          {text(vars.year)}
        </span>
      </div>
      <span data-part="time" className={styles.time} style={part(parts, "time")}>
        {text(vars.time)}
      </span>
    </div>
  );
}

function ActionItem({
  href,
  icon,
  label,
  actionPart,
  iconPart,
  labelPart,
  parts,
}: {
  href: string;
  icon: string;
  label: string;
  actionPart: string;
  iconPart: string;
  labelPart: string;
  parts?: Record<string, InvitePartStyle>;
}) {
  const external = /^https?:///i.test(href);

  const content = (
    <>
      <span data-part={iconPart} className={styles.actionIcon} style={part(parts, iconPart)}>
        <InvitePartIcon name={icon} strokeWidth={1.55} />
      </span>
      <span data-part={labelPart} className={styles.actionLabel} style={part(parts, labelPart)}>
        {label}
      </span>
    </>
  );

  if (external) {
    return (
      <a
        data-part={actionPart}
        className={styles.action}
        style={part(parts, actionPart)}
        href={href}
        target="_blank"
        rel="noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      data-part={actionPart}
      className={styles.action}
      style={part(parts, actionPart)}
      href={href}
    >
      {content}
    </Link>
  );
}

function ActionMenuBlock({
  variant,
  vars,
  parts,
}: {
  variant: string;
  vars: Record<string, string | undefined>;
  parts?: Record<string, InvitePartStyle>;
}) {
  return (
    <nav
      data-part="container"
      className={`${styles.actions} ${styles[`actions_${variant.replaceAll("-", "_")}`] || ""}`}
      style={part(parts, "container")}
      aria-label="Ações do convite"
    >
      <ActionItem
        href={vars.maps_url || "#"}
        icon="map-pin"
        label="Como chegar"
        actionPart="map-action"
        iconPart="map-icon"
        labelPart="map-label"
        parts={parts}
      />
      <ActionItem
        href="/presenca"
        icon="check"
        label="Confirmar"
        actionPart="rsvp-action"
        iconPart="rsvp-icon"
        labelPart="rsvp-label"
        parts={parts}
      />
      <ActionItem
        href="/presentes"
        icon="gift"
        label="Presentes"
        actionPart="gifts-action"
        iconPart="gifts-icon"
        labelPart="gifts-label"
        parts={parts}
      />
    </nav>
  );
}

function EventLocationBlock({
  variant,
  vars,
  parts,
}: {
  variant: string;
  vars: Record<string, string | undefined>;
  parts?: Record<string, InvitePartStyle>;
}) {
  return (
    <div
      data-part="container"
      className={`${styles.location} ${styles[`location_${variant.replaceAll("-", "_")}`] || ""}`}
      style={part(parts, "container")}
    >
      <span data-part="icon" className={styles.locationIcon} style={part(parts, "icon")}>
        <InvitePartIcon name="map-pin" strokeWidth={1.45} />
      </span>
      <div className={styles.locationCopy}>
        <strong data-part="venue" style={part(parts, "venue")}>{text(vars.venue)}</strong>
        <span data-part="city" style={part(parts, "city")}>{text(vars.city)}</span>
      </div>
      <span data-part="time" className={styles.locationTime} style={part(parts, "time")}>
        {text(vars.time)}
      </span>
    </div>
  );
}

export function InviteStructureBlock({
  element,
  vars,
}: {
  element: InviteElement;
  vars: Record<string, string | undefined>;
}) {
  const variant = element.variant || "";

  if (element.slot === "event-date") {
    return <EventDateBlock variant={variant} vars={vars} parts={element.partStyles} />;
  }

  if (element.slot === "action-menu") {
    return <ActionMenuBlock variant={variant} vars={vars} parts={element.partStyles} />;
  }

  if (element.slot === "event-location") {
    return <EventLocationBlock variant={variant} vars={vars} parts={element.partStyles} />;
  }

  return null;
}
