import "server-only";
import { ConnectorError, type Connector, type NormalizedAsset, type VerifyResult } from "./types";

// Vercel connector via account token (doc/05 API-token flow).
// Read-only: verifies identity, syncs projects + their domains + deployment
// summary. No deploys/mutations.
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

// best-effort: never let a per-project enrichment call fail the whole sync
async function tryGet(token: string, path: string): Promise<any | null> {
  try {
    return await get(token, path);
  } catch {
    return null;
  }
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
    const slug = ctx?.accountName || "dashboard";
    const projectUrl = (name: string) => `https://vercel.com/${slug}/${name}`;
    const out: NormalizedAsset[] = [];
    let until: string | undefined;

    for (let i = 0; i < 10; i++) {
      const qs = new URLSearchParams({ limit: "100" });
      if (until) qs.set("until", until);
      const data = await get(token, `/v9/projects?${qs}`);

      for (const p of data.projects ?? []) {
        // domains for this project
        const domData = await tryGet(token, `/v9/projects/${p.id}/domains?limit=100`);
        const domains: any[] = domData?.domains ?? [];

        // recent deployments (capped) for a count + latest state
        const depData = await tryGet(token, `/v6/deployments?projectId=${p.id}&limit=100`);
        const deployments: any[] = depData?.deployments ?? [];
        const capped = Boolean(depData?.pagination?.next);
        const latest = deployments[0] ?? p.latestDeployments?.[0];
        const prodDomain =
          domains.find((d) => !d.name?.includes("vercel.app"))?.name ??
          p.targets?.production?.alias?.[0] ??
          domains[0]?.name;

        // the project itself → website asset
        out.push({
          assetType: "website",
          name: p.name,
          displayName: p.name,
          status: (latest?.state ?? latest?.readyState ?? "unknown").toString().toLowerCase(),
          environment: "production",
          externalId: String(p.id),
          externalUrl: prodDomain ? `https://${prodDomain}` : undefined,
          providerConsoleUrl: projectUrl(p.name),
          metadata: {
            framework: p.framework,
            nodeVersion: p.nodeVersion,
            gitRepo: p.link?.repo ?? null,
            updatedAt: p.updatedAt,
            productionDomain: prodDomain ?? null,
            deploymentCount: capped ? `${deployments.length}+` : deployments.length,
            latestDeployment: latest
              ? {
                  state: (latest.state ?? latest.readyState ?? "unknown").toString().toLowerCase(),
                  url: latest.url ? `https://${latest.url}` : null,
                  createdAt: latest.created ?? latest.createdAt ?? null,
                }
              : null,
            domains: domains.map((d) => ({ name: d.name, verified: Boolean(d.verified) })),
          },
        });

        // each custom domain → domain asset (shows up in Infra, cross-links back)
        for (const d of domains) {
          if (d.name?.endsWith(".vercel.app")) continue; // skip system domains
          out.push({
            assetType: "domain",
            name: d.name,
            displayName: d.name,
            status: d.verified ? "verified" : "unverified",
            externalId: d.name,
            externalUrl: `https://${d.name}`,
            providerConsoleUrl: `${projectUrl(p.name)}/settings/domains`,
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
