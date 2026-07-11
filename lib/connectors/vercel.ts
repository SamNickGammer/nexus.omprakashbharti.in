import "server-only";
import { ConnectorError, type Connector, type NormalizedAsset, type VerifyResult } from "./types";

// Vercel connector via account token (doc/05 API-token flow).
// Read-only: verifies identity, syncs projects + their domains + deployment
// history. Console URLs are derived from Vercel's own deployment inspectorUrl
// (https://vercel.com/<slug>/<project>/<id>) so they're always correct.
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

async function get(token: string, path: string) {
  const res = await fetch(`${API}${path}`, { headers: headers(token), cache: "no-store" });
  if (!res.ok) throw mapError(res.status);
  return res.json();
}

async function tryGet(token: string, path: string): Promise<any | null> {
  try {
    return await get(token, path);
  } catch {
    return null;
  }
}

// inspectorUrl = https://vercel.com/<slug>/<project>/<deploymentId>
// → https://vercel.com/<slug>/<project>
function projectBaseFromInspector(inspectorUrl?: string | null): string | null {
  if (!inspectorUrl) return null;
  return inspectorUrl.slice(0, inspectorUrl.lastIndexOf("/")) || null;
}

export const vercel: Connector = {
  provider: "vercel",
  tokenHelpUrl: "https://vercel.com/account/tokens",

  async verify(token) {
    const { user } = await get(token, "/v2/user");
    return {
      externalAccountId: String(user.id ?? user.uid),
      externalAccountName: user.username ?? user.email,
    } satisfies VerifyResult;
  },

  async sync(token, ctx) {
    // account slug for projects with no deployments to derive a URL from
    const teams = await tryGet(token, "/v2/teams");
    const fallbackSlug = teams?.teams?.[0]?.slug || ctx?.accountName || "dashboard";
    const out: NormalizedAsset[] = [];
    let until: string | undefined;

    for (let i = 0; i < 10; i++) {
      const qs = new URLSearchParams({ limit: "100" });
      if (until) qs.set("until", until);
      const data = await get(token, `/v9/projects?${qs}`);

      for (const p of data.projects ?? []) {
        const domData = await tryGet(token, `/v9/projects/${p.id}/domains?limit=100`);
        const domains: any[] = domData?.domains ?? [];

        const depData = await tryGet(token, `/v6/deployments?projectId=${p.id}&limit=100`);
        const rawDeploys: any[] = depData?.deployments ?? [];
        const capped = Boolean(depData?.pagination?.next);
        const latest = rawDeploys[0];

        // authoritative project console URL from Vercel itself
        const base =
          projectBaseFromInspector(latest?.inspectorUrl) ?? `https://vercel.com/${fallbackSlug}/${p.name}`;

        const prodDomain =
          domains.find((d) => !d.name?.endsWith(".vercel.app"))?.name ??
          p.targets?.production?.alias?.[0] ??
          domains[0]?.name;

        const deployments = rawDeploys.slice(0, 12).map((d) => ({
          state: (d.state ?? d.readyState ?? "unknown").toString().toLowerCase(),
          url: d.url ? `https://${d.url}` : null,
          createdAt: d.created ?? d.createdAt ?? null,
          target: d.target ?? null,
          inspectorUrl: d.inspectorUrl ?? null,
        }));

        out.push({
          assetType: "website",
          name: p.name,
          displayName: p.name,
          status: (latest?.state ?? latest?.readyState ?? "unknown").toString().toLowerCase(),
          environment: "production",
          externalId: String(p.id),
          externalUrl: prodDomain ? `https://${prodDomain}` : latest?.url ? `https://${latest.url}` : undefined,
          providerConsoleUrl: base,
          metadata: {
            framework: p.framework,
            nodeVersion: p.nodeVersion,
            gitRepo: p.link?.repo ?? null,
            updatedAt: p.updatedAt,
            productionDomain: prodDomain ?? null,
            deploymentCount: capped ? `${rawDeploys.length}+` : rawDeploys.length,
            latestDeployment: deployments[0] ?? null,
            deployments,
            domains: domains.map((d) => ({ name: d.name, verified: Boolean(d.verified) })),
          },
        });

        for (const d of domains) {
          if (d.name?.endsWith(".vercel.app")) continue;
          out.push({
            assetType: "domain",
            name: d.name,
            displayName: d.name,
            status: d.verified ? "verified" : "unverified",
            externalId: d.name,
            externalUrl: `https://${d.name}`,
            providerConsoleUrl: `${base}/settings/domains`,
            metadata: {
              apexName: d.apexName ?? null,
              project: p.name,
              projectExternalId: String(p.id),
            },
          });
        }
      }

      const next = data.pagination?.next;
      if (!next) break;
      until = String(next);
    }

    return out;
  },
};
