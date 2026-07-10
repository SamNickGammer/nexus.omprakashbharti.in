// Status chip — terminal tag with a leading glyph, colored off the theme vars.
export type Status = "healthy" | "degraded" | "high" | "offline" | "deploying";

const MAP: Record<Status, { color: string; glyph: string }> = {
  healthy: { color: "text-ok", glyph: "●" },
  degraded: { color: "text-warn", glyph: "▲" },
  high: { color: "text-hot", glyph: "▲" },
  offline: { color: "text-down", glyph: "■" },
  deploying: { color: "text-blue", glyph: "◇" },
};

export function StatusBadge({ status }: { status: Status }) {
  const { color, glyph } = MAP[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 border border-edge bg-panel px-2 py-0.5 text-[11px] uppercase tracking-wide ${color}`}
    >
      <span aria-hidden>{glyph}</span>
      {status}
    </span>
  );
}
