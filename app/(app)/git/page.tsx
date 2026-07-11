import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { listRepos } from "@/lib/connections";

export const metadata: Metadata = { title: "Git — Nexus" };

export default async function GitPage() {
  const session = await getSession();
  const repos = session ? await listRepos(session.workspaceId) : [];

  return (
    <div className="space-y-6 p-6">
      <header className="term-panel p-5">
        <div className="grad-rule absolute inset-x-0 top-0" />
        <p className="text-[11px] tracking-[0.3em] text-dim">OBSERVE / GIT</p>
        <h1 className="mt-2 text-xl text-text">Repositories</h1>
        <p className="mt-1 text-sm text-muted">Every repository across your connected GitHub accounts.</p>
      </header>

      <section className="term-panel">
        <div className="border-b border-edge px-4 py-3 text-sm text-text">
          repositories<span className="text-dim"> // {repos.length}</span>
        </div>
        {repos.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">
            No repositories yet. Connect GitHub and resync to populate this.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-dim">
                  <th className="px-4 py-2 font-normal">repository</th>
                  <th className="px-4 py-2 font-normal">language</th>
                  <th className="px-4 py-2 font-normal">★</th>
                  <th className="px-4 py-2 font-normal">branch</th>
                  <th className="px-4 py-2 font-normal">visibility</th>
                  <th className="px-4 py-2 font-normal">source</th>
                </tr>
              </thead>
              <tbody>
                {repos.map((r) => {
                  const m = (r.metadata ?? {}) as Record<string, any>;
                  return (
                    <tr key={r.id} className="border-t border-edge hover:bg-surface">
                      <td className="px-4 py-2.5">
                        <Link href={`/assets/${r.id}`} className="text-text hover:text-cyan">{r.name}</Link>
                      </td>
                      <td className="px-4 py-2.5 text-muted">{m.language ?? "—"}</td>
                      <td className="px-4 py-2.5 text-muted">{m.stars ?? 0}</td>
                      <td className="px-4 py-2.5 text-dim">{m.defaultBranch ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[11px] uppercase ${r.status === "public" ? "text-muted" : "text-warn"}`}>
                          {r.status ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-dim">{r.accountLabel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
