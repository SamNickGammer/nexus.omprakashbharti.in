import { StatusBadge, type Status } from "./components/status-badge";

// Overview shell. Placeholder data until connectors + Neon land (Phase 2+).
const STATS = [
  { label: "assets_tracked", value: "0", hint: "connect a provider", tone: "text-text" },
  { label: "healthy", value: "0", hint: "of 0 checked", tone: "text-ok" },
  { label: "degraded", value: "0", hint: "needs attention", tone: "text-warn" },
  { label: "open_alerts", value: "5", hint: "3 high · 2 medium", tone: "text-down" },
];

const ASSETS: {
  name: string;
  ref: string;
  type: string;
  cpu: string;
  status: Status;
}[] = [
  { name: "nexus.omprakashbharti.in", ref: "domain · cloudflare", type: "Domain", cpu: "—", status: "healthy" },
  { name: "primary-db", ref: "10.0.1.50 · neon", type: "Database", cpu: "65%", status: "degraded" },
  { name: "auth-worker-main", ref: "192.168.2.45 · vps", type: "Server", cpu: "68%", status: "high" },
  { name: "payment-processor", ref: "192.168.3.11 · vps", type: "Server", cpu: "15%", status: "deploying" },
  { name: "search-indexer", ref: "10.0.4.12 · vps", type: "Server", cpu: "—", status: "offline" },
];

export default function OverviewPage() {
  return (
    <div className="space-y-6 p-6">
      {/* hero: terminal status header — the signature moment */}
      <section className="term-panel p-5">
        <div className="grad-rule absolute inset-x-0 top-0" />
        <p className="text-[11px] tracking-[0.3em] text-dim">OVERVIEW / SPARKPIXEL</p>
        <div className="mt-3 space-y-1 text-sm leading-relaxed">
          <p>
            <span className="text-cyan">$</span>{" "}
            <span className="text-text">nexus status --all</span>
          </p>
          <p className="text-muted">
            <span className="text-ok">●</span> operational
            <span className="mx-3 text-dim">|</span>
            uptime <span className="text-text">42d 06h</span>
            <span className="mx-3 text-dim">|</span>
            region <span className="text-text">blr-1</span>
            <span className="mx-3 text-dim">|</span>
            last sync <span className="text-text">just now</span>
            <span className="cursor ml-2 align-middle" />
          </p>
        </div>
      </section>

      {/* stat rail */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="term-panel p-4">
            <p className="text-[11px] tracking-wide text-dim">{s.label}</p>
            <p className={`mt-2 text-3xl font-bold ${s.tone}`}>{s.value}</p>
            <p className="mt-1 text-[11px] text-muted">{s.hint}</p>
          </div>
        ))}
      </section>

      {/* assets table */}
      <section className="term-panel">
        <div className="flex items-center justify-between border-b border-edge px-4 py-3">
          <span className="text-sm text-text">
            active_instances<span className="text-dim"> // {ASSETS.length}</span>
          </span>
          <span className="text-[11px] text-dim">realtime</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-dim">
                <th className="px-4 py-2 font-normal">name &amp; ref</th>
                <th className="px-4 py-2 font-normal">type</th>
                <th className="px-4 py-2 font-normal">cpu</th>
                <th className="px-4 py-2 font-normal">status</th>
              </tr>
            </thead>
            <tbody>
              {ASSETS.map((a) => (
                <tr
                  key={a.name}
                  className="border-t border-edge transition-colors hover:bg-surface"
                >
                  <td className="px-4 py-3">
                    <div className="text-text">{a.name}</div>
                    <div className="text-[11px] text-dim">{a.ref}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">{a.type}</td>
                  <td className="px-4 py-3 text-muted">{a.cpu}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
