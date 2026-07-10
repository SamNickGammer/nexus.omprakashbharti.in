import type { Metadata } from "next";
import { PROVIDERS } from "@/lib/providers";
import { ProviderLogo } from "../../components/provider-logo";

export const metadata: Metadata = { title: "Integrations — Nexus" };

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 p-6">
      <header className="term-panel p-5">
        <div className="grad-rule absolute inset-x-0 top-0" />
        <p className="text-[11px] tracking-[0.3em] text-dim">INTEGRATIONS</p>
        <h1 className="mt-2 text-xl text-text">Connect a provider</h1>
        <p className="mt-1 text-sm text-muted">
          Nexus syncs read-only metadata from each provider. Risky actions deep-link
          to the provider console — nothing destructive runs here.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PROVIDERS.map((p) => (
          <div key={p.key} className="term-panel flex flex-col gap-4 p-4">
            <div className="flex items-start gap-3">
              <ProviderLogo provider={p} />
              <div className="min-w-0">
                <div className="text-sm text-text">{p.name}</div>
                <div className="text-[11px] uppercase tracking-wide text-dim">{p.category}</div>
              </div>
            </div>
            <p className="flex-1 text-[13px] leading-relaxed text-muted">{p.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-dim">not connected</span>
              <button
                type="button"
                className="border border-edge-bright px-3 py-1 text-xs text-text transition-colors hover:border-cyan hover:text-cyan"
              >
                connect →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
