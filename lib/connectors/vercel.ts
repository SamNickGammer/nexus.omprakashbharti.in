import "server-only";
import { ConnectorError, type Connector, type NormalizedAsset, type VerifyResult } from "./types";

// Vercel connector via account token (doc/05 API-token flow).
// Read-only: verifies identity, syncs projects. No deploys/mutations.
const API = "https://api.vercel.com";

function headers(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function mapError(status: number): ConnectorError {
  if (status === 401 || status === 403)
    return new ConnectorError("invalid_credentials", "Vercel rejected the token.");
  if (status === 429) return new ConnectorError("rate_limited", "Vercel rate limit hit.");
  if (status >= 500) return new ConnectorError("provider_unavailable", "Vercel is unavailable.");
  return new ConnectorError("unknown_error", `Vercel error (${status}).`);
}

export const vercel: Connector = {
  provider: "vercel",
  tokenHelpUrl: "https://vercel.com/account/tokens",

  async verify(token) {
    const res = await fetch(`${API}/v2/user`, { headers: headers(token), cache: "no-store" });
    if (!res.ok) throw mapError(res.status);
    const { user } = await res.json();
    return {
      externalAccountId: String(user.id ?? user.uid),
      externalAccountName: user.username ?? user.email,
    } satisfies VerifyResult;
  },

  async sync(token) {
    const out: NormalizedAsset[] = [];
    let until: string | undefined;
    for (let i = 0; i < 10; i++) {
      const url = new URL(`${API}/v9/projects`);
      url.searchParams.set("limit", "100");
      if (until) url.searchParams.set("until", until);
      const res = await fetch(url, { headers: headers(token), cache: "no-store" });
      if (!res.ok) throw mapError(res.status);
      const data = await res.json();
      for (const p of data.projects ?? []) {
        const latest = p.latestDeployments?.[0];
        const domain = p.targets?.production?.alias?.[0] ?? latest?.alias?.[0];
        out.push({
          assetType: "website",
          name: p.name,
          displayName: p.name,
          status: latest?.readyState?.toLowerCase() ?? "unknown",
          environment: "production",
          externalId: String(p.id),
          externalUrl: domain ? `https://${domain}` : undefined,
          providerConsoleUrl: `https://vercel.com/dashboard/${p.name}`,
          metadata: {
            framework: p.framework,
            nodeVersion: p.nodeVersion,
            gitRepo: p.link?.repo ?? p.link?.repoId,
            updatedAt: p.updatedAt,
            domain,
          },
        });
      }
      const next = data.pagination?.next;
      if (!next) break;
      until = String(next);
    }
    return out;
  },
};
