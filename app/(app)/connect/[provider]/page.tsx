import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProvider, isConnectable } from "@/lib/providers";
import { getConnector } from "@/lib/connectors";
import { ProviderLogo } from "../../../components/provider-logo";
import { ConnectForm } from "./connect-form";

export const metadata: Metadata = { title: "Connect — Nexus" };

const HELP: Record<string, string> = {
  github: "Create a token with read access to repositories (repo / read:user).",
  vercel: "Create an account token in Vercel settings — read access is enough.",
};

export default function ConnectPage({ params }: { params: { provider: string } }) {
  const provider = getProvider(params.provider);
  const connector = getConnector(params.provider);
  if (!provider || !isConnectable(params.provider) || !connector) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <Link href="/integrations" className="text-[13px] text-dim hover:text-cyan">
        ← integrations
      </Link>

      <div className="term-panel p-6">
        <div className="grad-rule absolute inset-x-0 top-0" />
        <div className="mb-5 flex items-center gap-3">
          <ProviderLogo provider={provider} />
          <div>
            <h1 className="text-lg text-text">Connect {provider.name}</h1>
            <p className="text-[11px] uppercase tracking-wide text-dim">{provider.category}</p>
          </div>
        </div>

        <p className="mb-4 text-[13px] leading-relaxed text-muted">
          {HELP[provider.key]}{" "}
          <a href={connector.tokenHelpUrl} target="_blank" rel="noreferrer" className="text-cyan hover:underline">
            Create token ↗
          </a>
        </p>

        <ConnectForm provider={provider.key} name={provider.name} />
      </div>
    </div>
  );
}
