import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { listConnections } from "@/lib/connections";
import { getProvider } from "@/lib/providers";
import { ProviderLogo } from "../../components/provider-logo";

export const metadata: Metadata = { title: "Connections — Nexus" };

const STATUS: Record<string, string> = {
  active: "text-ok",
  degraded: "text-warn",
  disconnected: "text-down",
};

function ago(d: Date | null): string {
  if (!d) return "never";
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function ConnectionsPage() {
  const session = await getSession();
  const rows = session ? await listConnections(session.workspaceId) : [];

  return (
    <div className="space-y-6 p-6">
      <header className="term-panel flex items-center justify-between p-5">
        <div className="grad-rule absolute inset-x-0 top-0" />
        <div>
          <p className="text-[11px] tracking-[0.3em] text-dim">CONNECTIONS</p>
          <h1 className="mt-2 text-xl text-text">Connected accounts</h1>
          <p className="mt-1 text-sm text-muted">Every provider account you've linked, across all providers.</p>
        </div>
        <Link
          href="/integrations"
          className="border border-edge-bright px-3 py-1.5 text-sm text-text transition-colors hover:border-cyan hover:text-cyan"
        >
          + add
        </Link>
      </header>

      {rows.length === 0 ? (
        <div className="term-panel p-10 text-center">
          <p className="text-sm text-muted">No connections yet.</p>
          <Link href="/integrations" className="mt-2 inline-block text-sm text-cyan hover:underline">
            Connect your first provider →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {rows.map((c) => {
            const provider = getProvider(c.provider);
            return (
              <Link
                key={c.id}
                href={`/connections/${c.id}`}
                className="term-panel flex items-center gap-4 p-4 transition-colors hover:border-edge-bright"
              >
                {provider && <ProviderLogo provider={provider} />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm text-text">
                    <span className="truncate">{c.label}</span>
                    <span className={`text-[11px] uppercase ${STATUS[c.status] ?? "text-dim"}`}>● {c.status}</span>
                  </div>
                  <div className="text-[11px] text-dim">
                    {provider?.name} · {c.projectCount} projects · {c.domainCount} domains · synced {ago(c.lastSyncAt)}
                  </div>
                </div>
                <span className="text-dim">›</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
