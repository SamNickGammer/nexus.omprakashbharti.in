import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getConnectionDetail } from "@/lib/connections";
import { getProvider } from "@/lib/providers";
import { ProviderLogo } from "../../../components/provider-logo";
import { resync, disconnect } from "../actions";

export const metadata: Metadata = { title: "Connection — Nexus" };

const STATUS: Record<string, string> = {
  active: "text-ok", degraded: "text-warn", disconnected: "text-down",
  success: "text-ok", failed: "text-down", running: "text-blue",
  ready: "text-ok", unknown: "text-muted",
};

function when(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toISOString().replace("T", " ").slice(0, 16);
}

export default async function ConnectionDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getConnectionDetail(params.id, session.workspaceId);
  if (!data) notFound();

  const { account, credential, assets, runs } = data;
  const provider = getProvider(account.provider);

  // connection page shows PROJECTS only — domains live under Infra / Domains
  const projects = assets.filter((a) => a.assetType !== "domain");
  const domainCount = assets.length - projects.length;
  const projectNoun = account.provider === "github" ? "repos" : "projects";

  return (
    <div className="space-y-6 p-6">
      <Link href="/connections" className="text-[13px] text-dim hover:text-cyan">
        ← connections
      </Link>

      {/* header */}
      <div className="term-panel p-5">
        <div className="grad-rule absolute inset-x-0 top-0" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {provider && <ProviderLogo provider={provider} />}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg text-text">{account.label}</h1>
                <span className={`text-[11px] uppercase ${STATUS[account.status] ?? "text-dim"}`}>
                  ● {account.status}
                </span>
              </div>
              <p className="text-[11px] text-dim">
                {provider?.name} · {account.externalAccountName ?? "—"} · token {credential?.fingerprint ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <form action={resync}>
              <input type="hidden" name="id" value={account.id} />
              <button className="border border-edge-bright px-3 py-1.5 text-sm text-text transition-colors hover:border-cyan hover:text-cyan">
                ↻ resync
              </button>
            </form>
            <form action={disconnect}>
              <input type="hidden" name="id" value={account.id} />
              <button className="border border-edge px-3 py-1.5 text-sm text-muted transition-colors hover:border-down hover:text-down">
                disconnect
              </button>
            </form>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
          {[
            [projectNoun, String(projects.length)],
            ["domains", String(domainCount)],
            ["last sync", when(account.lastSyncAt)],
            ["verified", when(account.lastVerifiedAt)],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-[11px] uppercase tracking-wide text-dim">{k}</div>
              <div className="truncate text-text">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* projects — no raw URLs; click through to the project detail */}
      <section className="term-panel">
        <div className="flex items-center justify-between border-b border-edge px-4 py-3 text-sm text-text">
          <span>
            {projectNoun}<span className="text-dim"> // {projects.length}</span>
          </span>
          {domainCount > 0 && (
            <Link href="/domains" className="text-[11px] text-dim hover:text-cyan">
              {domainCount} domains in Infra →
            </Link>
          )}
        </div>
        {projects.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted">Nothing synced yet — try a resync.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-dim">
                  <th className="px-4 py-2 font-normal">name</th>
                  <th className="px-4 py-2 font-normal">status</th>
                  <th className="px-4 py-2 font-normal">deployments</th>
                  <th className="px-4 py-2 font-normal">framework</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((a) => {
                  const m = (a.metadata ?? {}) as Record<string, any>;
                  return (
                    <tr key={a.id} className="border-t border-edge hover:bg-surface">
                      <td className="px-4 py-2.5">
                        <Link href={`/assets/${a.id}`} className="text-text hover:text-cyan">
                          {a.displayName ?? a.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[11px] uppercase ${STATUS[a.status ?? ""] ?? "text-muted"}`}>
                          ● {a.status ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted">{m.deploymentCount ?? "—"}</td>
                      <td className="px-4 py-2.5 text-muted">{m.framework ?? m.language ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* sync history */}
      <section className="term-panel">
        <div className="border-b border-edge px-4 py-3 text-sm text-text">sync_runs</div>
        <div className="divide-y divide-edge">
          {runs.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
              <span className={STATUS[r.status] ?? "text-dim"}>● {r.status}</span>
              <span className="text-muted">{r.resourcesSeen ?? 0} seen</span>
              <span className="text-dim">{when(r.startedAt)}</span>
              <span className="text-down">{r.errorCode ?? ""}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
