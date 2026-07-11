import Link from "next/link";
import { getSession } from "@/lib/auth";
import { listAllAssets, listConnections } from "@/lib/connections";

const ATTENTION = new Set(["unknown", "unverified", "degraded", "offline", "error", "failed"]);

const TONE: Record<string, string> = {
  ready: "text-ok", active: "text-ok", verified: "text-ok", public: "text-ok",
  degraded: "text-warn", unverified: "text-warn", building: "text-blue", queued: "text-blue",
  error: "text-down", offline: "text-down", unknown: "text-muted",
};
const tone = (s?: string | null) => (s && TONE[s]) || "text-muted";

function host(url?: string | null): string {
  if (!url) return "—";
  try { return new URL(url).host; } catch { return url; }
}

export default async function OverviewPage() {
  const session = await getSession();
  const [assets, conns] = session
    ? await Promise.all([listAllAssets(session.workspaceId), listConnections(session.workspaceId)])
    : [[], []];

  const projects = assets.filter((a) => a.assetType === "website");
  const domains = assets.filter((a) => a.assetType === "domain");
  const attention = assets.filter((a) => a.status && ATTENTION.has(a.status));

  const stats = [
    { label: "assets_tracked", value: assets.length, hint: `${conns.length} connections`, tone: "text-text" },
    { label: "projects", value: projects.length, hint: "websites & apps", tone: "text-ok" },
    { label: "domains", value: domains.length, hint: "custom domains", tone: "text-text" },
    { label: "needs_attention", value: attention.length, hint: "unverified / errored", tone: attention.length ? "text-down" : "text-ok" },
  ];

  return (
    <div className="space-y-6 p-6">
      <section className="term-panel p-5">
        <div className="grad-rule absolute inset-x-0 top-0" />
        <p className="text-[11px] tracking-[0.3em] text-dim">OVERVIEW</p>
        <div className="mt-3 space-y-1 text-sm leading-relaxed">
          <p>
            <span className="text-cyan">$</span> <span className="text-text">nexus status --all</span>
          </p>
          <p className="text-muted">
            <span className={attention.length ? "text-warn" : "text-ok"}>●</span>{" "}
            {attention.length ? "degraded" : "operational"}
            <span className="mx-3 text-dim">|</span>
            assets <span className="text-text">{assets.length}</span>
            <span className="mx-3 text-dim">|</span>
            connections <span className="text-text">{conns.length}</span>
            <span className="cursor ml-2 align-middle" />
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="term-panel p-4">
            <p className="text-[11px] tracking-wide text-dim">{s.label}</p>
            <p className={`mt-2 text-3xl font-bold ${s.tone}`}>{s.value}</p>
            <p className="mt-1 text-[11px] text-muted">{s.hint}</p>
          </div>
        ))}
      </section>

      <section className="term-panel">
        <div className="flex items-center justify-between border-b border-edge px-4 py-3">
          <span className="text-sm text-text">
            projects<span className="text-dim"> // {projects.length}</span>
          </span>
          <Link href="/integrations" className="text-[11px] text-dim hover:text-cyan">+ connect</Link>
        </div>

        {assets.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-muted">No assets yet.</p>
            <Link href="/integrations" className="mt-2 inline-block text-sm text-cyan hover:underline">
              Connect a provider to start syncing →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-dim">
                  <th className="px-4 py-2 font-normal">name</th>
                  <th className="px-4 py-2 font-normal">source</th>
                  <th className="px-4 py-2 font-normal">domain</th>
                  <th className="px-4 py-2 font-normal">status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((a) => (
                  <tr key={a.id} className="border-t border-edge hover:bg-surface">
                    <td className="px-4 py-3">
                      <Link href={`/assets/${a.id}`} className="text-text hover:text-cyan">
                        {a.displayName ?? a.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-dim">{a.provider} · {a.accountLabel}</td>
                    <td className="px-4 py-3 text-muted">{host(a.externalUrl)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] uppercase ${tone(a.status)}`}>● {a.status ?? "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
