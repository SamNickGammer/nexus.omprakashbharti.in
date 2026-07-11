import "server-only";
import { ConnectorError, type Connector, type NormalizedAsset, type VerifyResult } from "./types";

// ── on-demand repository detail (fetched live when a repo asset is opened) ──
export type RepoDetail = {
  languages: { name: string; bytes: number; pct: number }[];
  contributors: { login: string; avatarUrl: string; contributions: number; htmlUrl: string }[];
  commits: {
    sha: string;
    message: string;
    authorLogin: string | null;
    authorAvatar: string | null;
    date: string | null;
    htmlUrl: string;
  }[];
  branches: { name: string; protected: boolean; sha: string }[];
  readme: string | null;
};

export async function githubRepoDetail(token: string, fullName: string): Promise<RepoDetail> {
  const [owner, repo] = fullName.split("/");
  // public repos are readable without auth; only attach the token when present
  const h: Record<string, string> = token ? headers(token) : {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "nexus-ops",
  };
  const base = `https://api.github.com/repos/${owner}/${repo}`;
  const j = async (path: string): Promise<any> => {
    const r = await fetch(`${base}${path}`, { headers: h, cache: "no-store" });
    return r.ok ? r.json() : null;
  };

  const [langs, contribs, commits, branches, readme] = await Promise.all([
    j(`/languages`),
    j(`/contributors?per_page=20`),
    j(`/commits?per_page=25`),
    j(`/branches?per_page=50`),
    (async () => {
      const r = await fetch(`${base}/readme`, { headers: h, cache: "no-store" });
      if (!r.ok) return null;
      const d = await r.json();
      return d?.content ? Buffer.from(d.content, "base64").toString("utf8") : null;
    })(),
  ]);

  const langEntries = langs ? (Object.entries(langs) as [string, number][]) : [];
  const total = langEntries.reduce((s, [, b]) => s + b, 0) || 1;

  return {
    languages: langEntries
      .map(([name, bytes]) => ({ name, bytes, pct: Math.round((bytes / total) * 100) }))
      .sort((a, b) => b.bytes - a.bytes),
    contributors: Array.isArray(contribs)
      ? contribs.map((c: any) => ({
          login: c.login,
          avatarUrl: c.avatar_url,
          contributions: c.contributions,
          htmlUrl: c.html_url,
        }))
      : [],
    commits: Array.isArray(commits)
      ? commits.map((c: any) => ({
          sha: String(c.sha).slice(0, 7),
          message: String(c.commit?.message ?? "").split("\n")[0],
          authorLogin: c.author?.login ?? c.commit?.author?.name ?? null,
          authorAvatar: c.author?.avatar_url ?? null,
          date: c.commit?.author?.date ?? null,
          htmlUrl: c.html_url,
        }))
      : [],
    branches: Array.isArray(branches)
      ? branches.map((b: any) => ({ name: b.name, protected: Boolean(b.protected), sha: String(b.commit?.sha ?? "").slice(0, 7) }))
      : [],
    readme,
  };
}

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

  async sync(token, _ctx) {
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
