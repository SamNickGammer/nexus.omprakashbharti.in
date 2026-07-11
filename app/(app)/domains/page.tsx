import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { listAssetsByType } from "@/lib/connections";

export const metadata: Metadata = { title: "Domains — Nexus" };

const TONE: Record<string, string> = { verified: "text-ok", unverified: "text-warn" };
const tone = (s?: string | null) => (s && TONE[s]) || "text-muted";

export default async function DomainsPage() {
  const session = await getSession();
  const domains = session ? await listAssetsByType(session.workspaceId, "domain") : [];

  return (
    <div className="space-y-6 p-6">
      <header className="term-panel p-5">
        <div className="grad-rule absolute inset-x-0 top-0" />
        <p className="text-[11px] tracking-[0.3em] text-dim">INFRA / DOMAINS</p>
        <h1 className="mt-2 text-xl text-text">Domains &amp; DNS</h1>
        <p className="mt-1 text-sm text-muted">Custom domains discovered across every connected account.</p>
      </header>

      <section className="term-panel">
        <div className="border-b border-edge px-4 py-3 text-sm text-text">
          domains<span className="text-dim"> // {domains.length}</span>
        </div>
        {domains.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">
            No domains yet. Connect a provider with domains (e.g. Vercel) and resync.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-dim">
                  <th className="px-4 py-2 font-normal">domain</th>
                  <th className="px-4 py-2 font-normal">status</th>
                  <th className="px-4 py-2 font-normal">source</th>
                  <th className="px-4 py-2 font-normal">links</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((d) => (
                  <tr key={d.id} className="border-t border-edge hover:bg-surface">
                    <td className="px-4 py-2.5">
                      <Link href={`/assets/${d.id}`} className="text-text hover:text-cyan">{d.name}</Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[11px] uppercase ${tone(d.status)}`}>● {d.status ?? "—"}</span>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-dim">{d.provider} · {d.accountLabel}</td>
                    <td className="px-4 py-2.5">
                      {d.externalUrl && (
                        <a href={d.externalUrl} target="_blank" rel="noreferrer" className="text-cyan hover:underline">open ↗</a>
                      )}
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
