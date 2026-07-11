import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAssetDetail, getRepoLiveDetail } from "@/lib/connections";
import { getProvider } from "@/lib/providers";
import { ProviderLogo } from "../../../components/provider-logo";
import { RepoTabs } from "../../../components/repo-tabs";

// stable-ish color per language name (hash → hue)
function langColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h} 70% 55%)`;
}

export const metadata: Metadata = { title: "Asset — Nexus" };

const TONE: Record<string, string> = {
  active: "text-ok", ready: "text-ok", verified: "text-ok", public: "text-ok",
  degraded: "text-warn", unverified: "text-warn", building: "text-blue", queued: "text-blue",
  error: "text-down", offline: "text-down", private: "text-muted",
};
const tone = (s?: string | null) => (s && TONE[s]) || "text-muted";

function when(d: unknown): string {
  if (!d) return "—";
  const t = typeof d === "number" ? d : Date.parse(String(d));
  if (Number.isNaN(t)) return String(d);
  return new Date(t).toISOString().replace("T", " ").slice(0, 16);
}

function Stat({ k, v, tone: t }: { k: string; v: React.ReactNode; tone?: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-dim">{k}</div>
      <div className={`truncate ${t ?? "text-text"}`}>{v}</div>
    </div>
  );
}

export default async function AssetDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getAssetDetail(params.id, session.workspaceId);
  if (!data) notFound();

  const { asset, account, linked } = data;
  const repo = asset.assetType === "repository" ? await getRepoLiveDetail(asset.id, session.workspaceId) : null;
  const provider = account ? getProvider(account.provider) : undefined;
  const m = (asset.metadata ?? {}) as Record<string, any>;
  const latest = m.latestDeployment as { state?: string; url?: string; createdAt?: unknown } | null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3 text-[13px] text-dim">
        <Link href="/connections" className="hover:text-cyan">connections</Link>
        {account && (
          <>
            <span>/</span>
            <Link href={`/connections/${account.id}`} className="hover:text-cyan">{account.label}</Link>
          </>
        )}
      </div>

      {/* header */}
      <div className="term-panel p-5">
        <div className="grad-rule absolute inset-x-0 top-0" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {provider && <ProviderLogo provider={provider} />}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg text-text">{asset.displayName ?? asset.name}</h1>
                <span className={`text-[11px] uppercase ${tone(asset.status)}`}>● {asset.status ?? "—"}</span>
              </div>
              <p className="text-[11px] text-dim">
                {asset.assetType} · {provider?.name} · {account?.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {asset.externalUrl && (
              <a href={asset.externalUrl} target="_blank" rel="noreferrer" className="text-cyan hover:underline">open ↗</a>
            )}
            {asset.providerConsoleUrl && (
              <a href={asset.providerConsoleUrl} target="_blank" rel="noreferrer" className="text-dim hover:text-cyan">console ↗</a>
            )}
          </div>
        </div>
      </div>

      {/* website (Vercel project) — deployment + domain detail */}
      {asset.assetType === "website" && (
        <>
          <section className="term-panel grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
            <Stat k="deployments" v={m.deploymentCount ?? "—"} />
            <Stat k="last deploy" v={latest ? (latest.state ?? "—") : "—"} tone={tone(latest?.state)} />
            <Stat k="last deploy at" v={when(latest?.createdAt)} />
            <Stat k="framework" v={m.framework ?? "—"} />
            <Stat k="production domain" v={m.productionDomain ?? "—"} />
            <Stat k="node" v={m.nodeVersion ?? "—"} />
            <Stat k="git repo" v={m.gitRepo ?? "—"} />
            <Stat k="synced" v={when(asset.lastSyncedAt)} />
          </section>

          {/* deployment log */}
          <section className="term-panel">
            <div className="border-b border-edge px-4 py-3 text-sm text-text">
              deployments<span className="text-dim"> // {m.deploymentCount ?? 0}</span>
            </div>
            {!Array.isArray(m.deployments) || m.deployments.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted">No deployments found.</p>
            ) : (
              <div className="divide-y divide-edge">
                {(m.deployments as any[]).map((d, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-2.5 text-[13px]">
                    <span className={`w-24 shrink-0 text-[11px] uppercase ${tone(d.state)}`}>● {d.state}</span>
                    <span className="w-20 shrink-0 truncate text-dim">{d.target ?? "—"}</span>
                    <span className="min-w-0 flex-1 truncate text-muted">{d.url ?? "—"}</span>
                    <span className="text-dim">{when(d.createdAt)}</span>
                    {d.inspectorUrl && (
                      <a href={d.inspectorUrl} target="_blank" rel="noreferrer" className="text-cyan hover:underline">
                        inspect ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* connected domains (cross-linked) */}
          <section className="term-panel">
            <div className="border-b border-edge px-4 py-3 text-sm text-text">
              connected_domains<span className="text-dim"> // {linked.length}</span>
            </div>
            {linked.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted">No custom domains connected.</p>
            ) : (
              linked.map((d) => (
                <Link key={d.id} href={`/assets/${d.id}`} className="flex items-center justify-between border-t border-edge px-4 py-2.5 text-sm hover:bg-surface">
                  <span className="text-text">{d.name}</span>
                  <span className={`text-[11px] uppercase ${tone(d.status)}`}>● {d.status ?? "—"}</span>
                </Link>
              ))
            )}
          </section>
        </>
      )}

      {/* domain — status + linked project */}
      {asset.assetType === "domain" && (
        <section className="term-panel grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">
          <Stat k="status" v={asset.status ?? "—"} tone={tone(asset.status)} />
          <Stat k="apex" v={m.apexName ?? "—"} />
          <Stat k="synced" v={when(asset.lastSyncedAt)} />
          {linked.map((p) => (
            <div key={p.id} className="col-span-2 sm:col-span-3">
              <div className="text-[11px] uppercase tracking-wide text-dim">deployed from</div>
              <Link href={`/assets/${p.id}`} className="text-cyan hover:underline">{p.name} →</Link>
            </div>
          ))}
        </section>
      )}

      {/* repository (GitHub) */}
      {asset.assetType === "repository" && (
        <>
          {/* languages + stat chips */}
          <section className="term-panel space-y-4 p-5">
            <div>
              <div className="mb-2 text-[11px] uppercase tracking-wide text-dim">languages</div>
              <div className="flex flex-wrap gap-2">
                {repo && repo.languages.length > 0 ? (
                  repo.languages.map((l) => (
                    <span key={l.name} className="inline-flex items-center gap-1.5 border border-edge bg-panel px-2 py-1 text-[12px] text-text">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: langColor(l.name) }} />
                      {l.name}
                      <span className="text-dim">{l.pct}%</span>
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted">{m.language ?? "—"}</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["★ stars", m.stars ?? 0],
                ["open issues", m.openIssues ?? 0],
                ["default", m.defaultBranch ?? "—"],
                ["visibility", m.visibility ?? "—"],
                ["pushed", when(m.pushedAt)],
                ["synced", when(asset.lastSyncedAt)],
              ].map(([k, v]) => (
                <span key={String(k)} className="border border-edge bg-panel px-2.5 py-1 text-[12px] text-muted">
                  <span className="text-dim">{k}</span> <span className="text-text">{String(v)}</span>
                </span>
              ))}
            </div>
          </section>

          {/* contributors */}
          <section className="term-panel p-5">
            <div className="mb-3 text-[11px] uppercase tracking-wide text-dim">
              contributors{repo?.contributors.length ? ` // ${repo.contributors.length}` : ""}
            </div>
            {repo && repo.contributors.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {repo.contributors.map((c) => (
                  <a key={c.login} href={c.htmlUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-cyan">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.avatarUrl} alt={c.login} width={28} height={28} className="rounded-full border border-edge" referrerPolicy="no-referrer" />
                    <span className="text-[13px] text-text">{c.login}</span>
                    <span className="text-[11px] text-dim">{c.contributions}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">
                {repo ? "No contributor data." : "Connect GitHub and open this repo to load contributors."}
              </p>
            )}
          </section>

          {/* readme / commits / branches */}
          {repo && <RepoTabs detail={repo} defaultBranch={m.defaultBranch} />}
        </>
      )}
    </div>
  );
}
