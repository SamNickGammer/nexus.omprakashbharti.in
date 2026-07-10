import { StatusBadge, type Status } from "./components/status-badge";

// Overview shell. Placeholder data until connectors + Neon land (Phase 2+).
const STATS = [
  { label: "Assets tracked", value: "0", hint: "connect a provider" },
  { label: "Healthy", value: "0", hint: "—" },
  { label: "Open alerts", value: "0", hint: "—" },
];

const ASSETS: { name: string; ref: string; type: string; status: Status }[] = [
  { name: "nexus.omprakashbharti.in", ref: "domain", type: "Domain", status: "healthy" },
  { name: "primary-db", ref: "neon", type: "Database", status: "degraded" },
  { name: "web-01", ref: "vps", type: "Server", status: "offline" },
];

export default function OverviewPage() {
  return (
    <div className="p-8">
      <header className="mb-6">
        <p className="text-[11px] tracking-widest text-neutral-500">OVERVIEW</p>
        <h1 className="text-2xl font-semibold text-white">Operations</h1>
        <p className="text-sm text-neutral-400">
          Normalized view of your infrastructure across providers.
        </p>
      </header>

      <section className="mb-8 grid grid-cols-3 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded border border-edge bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{s.label}</p>
            <p className="mt-1 text-3xl font-semibold text-white">{s.value}</p>
            <p className="mt-1 text-xs text-neutral-500">{s.hint}</p>
          </div>
        ))}
      </section>

      <section className="rounded border border-edge bg-surface">
        <div className="border-b border-edge px-4 py-3 text-sm font-medium text-neutral-300">
          Assets
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {ASSETS.map((a) => (
              <tr key={a.name} className="border-t border-edge">
                <td className="px-4 py-3">
                  <div className="text-neutral-100">{a.name}</div>
                  <div className="text-xs text-neutral-500">{a.ref}</div>
                </td>
                <td className="px-4 py-3 text-neutral-400">{a.type}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={a.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
