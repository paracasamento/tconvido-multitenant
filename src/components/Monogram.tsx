export function Monogram({
  size = 132,
  priority: _priority = false
}: {
  size?: number;
  priority?: boolean;
}) {
  return (
    <div
      className="monogram"
      aria-label="TConvido"
      style={{
        width: size,
        height: size,
        borderRadius: "999px",
        display: "grid",
        placeItems: "center",
        border: "1px solid rgba(15, 10, 113, 0.16)",
        color: "#0f0a71",
        fontFamily: "var(--font-display)",
        fontSize: Math.max(22, Math.round(size * 0.28)),
        fontWeight: 700,
        letterSpacing: "-0.04em",
        background: "rgba(255,255,255,.58)"
      }}
    >
      TC
    </div>
  );
}
