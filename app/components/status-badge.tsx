// Status chip — the signature health indicator from the ops-console reference.

export type Status = "healthy" | "degraded" | "high" | "offline" | "deploying";

const STYLES: Record<Status, string> = {
  healthy: "border-emerald-700 bg-emerald-950 text-emerald-400",
  degraded: "border-yellow-700 bg-yellow-950 text-yellow-400",
  high: "border-orange-700 bg-orange-950 text-orange-400",
  offline: "border-red-700 bg-red-950 text-red-400",
  deploying: "border-blue-700 bg-blue-950 text-blue-400",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
