import type { Metadata } from "next";
import Link from "next/link";
import { PROVIDERS, isConnectable } from "@/lib/providers";
import { getSession } from "@/lib/auth";
import { connectionCounts } from "@/lib/connections";
import { ProviderLogo } from "../../components/provider-logo";

export const metadata: Metadata = { title: "Integrations — Nexus" };

export default async function IntegrationsPage() {
  const session = await getSession();
  const counts = session ? await connectionCounts(session.workspaceId) : {};

  return (
    <div className="space-y-6 p-6">
      <header className="term-panel p-5">
        <div className="grad-rule absolute inset-x-0 top-0" />
        <p className="text-[11px] tracking-[0.3em] text-dim">INTEGRATIONS</p>
        <h1 className="mt-2 text-xl text-text">Connect a provider</h1>
        <p className="mt-1 text-sm text-muted">
          Nexus syncs read-only metadata from each provider. Connect one account or many —
          each stays a separate connection. Risky actions deep-link to the provider console.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PROVIDERS.map((p) => {
          const connectable = isConnectable(p.key);
          const count = counts[p.key] ?? 0;
          return (
            <div key={p.key} className="term-panel flex flex-col gap-4 p-4">
              <div className="flex items-start gap-3">
                <ProviderLogo provider={p} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm text-text">
                    {p.name}
                    {count > 0 && (
                      <span className="border border-edge px-1.5 text-[11px] text-ok">{count} connected</span>
                    )}
                  </div>
                  <div className="text-[11px] uppercase tracking-wide text-dim">{p.category}</div>
                </div>
              </div>

              <p className="flex-1 text-[13px] leading-relaxed text-muted">{p.desc}</p>

              <div className="flex items-center justify-between">
                {count > 0 ? (
                  <Link href="/connections" className="text-[11px] text-dim hover:text-cyan">
                    view accounts →
                  </Link>
                ) : (
                  <span className="text-[11px] text-dim">not connected</span>
                )}

                {connectable ? (
                  <Link
                    href={`/connect/${p.key}`}
                    className="border border-edge-bright px-3 py-1 text-xs text-text transition-colors hover:border-cyan hover:text-cyan"
                  >
                    {count > 0 ? "+ add account" : "connect →"}
                  </Link>
                ) : (
                  <span className="border border-edge px-3 py-1 text-xs text-dim">soon</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
