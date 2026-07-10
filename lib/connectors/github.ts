import "server-only";
import { ConnectorError, type Connector, type NormalizedAsset, type VerifyResult } from "./types";

// GitHub connector via personal access token (doc/04, doc/05 API-token flow).
// Read-only: verifies identity, syncs repository inventory. No mutations.
const API = "https://api.github.com";

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "nexus-ops",
  };
}

function mapError(status: number): ConnectorError {
  if (status === 401) return new ConnectorError("invalid_credentials", "GitHub rejected the token.");
  if (status === 403) return new ConnectorError("rate_limited", "GitHub rate limit or scope issue.");
  if (status >= 500) return new ConnectorError("provider_unavailable", "GitHub is unavailable.");
  return new ConnectorError("unknown_error", `GitHub error (${status}).`);
}

export const github: Connector = {
  provider: "github",
  tokenHelpUrl: "https://github.com/settings/tokens",

  async verify(token) {
    const res = await fetch(`${API}/user`, { headers: headers(token), cache: "no-store" });
    if (!res.ok) throw mapError(res.status);
    const u = await res.json();
    const scopes = (res.headers.get("x-oauth-scopes") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return { externalAccountId: String(u.id), externalAccountName: u.login, scopes } satisfies VerifyResult;
  },

  async sync(token) {
    const out: NormalizedAsset[] = [];
    // paginate owned repos, newest activity first
    for (let page = 1; page <= 10; page++) {
      const res = await fetch(
        `${API}/user/repos?per_page=100&page=${page}&sort=pushed&affiliation=owner,collaborator,organization_member`,
        { headers: headers(token), cache: "no-store" },
      );
      if (!res.ok) throw mapError(res.status);
      const repos: any[] = await res.json();
      if (repos.length === 0) break;
      for (const r of repos) {
        out.push({
          assetType: "repository",
          name: r.full_name,
          displayName: r.name,
          status: r.archived ? "archived" : r.private ? "private" : "public",
          externalId: String(r.id),
          externalUrl: r.html_url,
          providerConsoleUrl: `${r.html_url}/settings`,
          metadata: {
            language: r.language,
            defaultBranch: r.default_branch,
            visibility: r.visibility,
            stars: r.stargazers_count,
            openIssues: r.open_issues_count,
            pushedAt: r.pushed_at,
            fork: r.fork,
          },
        });
      }
      if (repos.length < 100) break;
    }
    return out;
  },
};
