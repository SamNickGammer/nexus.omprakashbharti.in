import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { listSyncRuns } from "@/lib/connections";

export const metadata: Metadata = { title: "Logs — Nexus" };

const TONE: Record<string, string> = { success: "text-ok", failed: "text-down", running: "text-blue" };

function ts(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toISOString().replace("T", " ").slice(0, 19);
}

export default async function LogsPage() {
  const session = await getSession();
  const runs = session ? await listSyncRuns(session.workspaceId, 200) : [];

  return (
    <div className="space-y-6 p-6">
      <header className="term-panel p-5">
        <div className="grad-rule absolute inset-x-0 top-0" />
        <p className="text-[11px] tracking-[0.3em] text-dim">OBSERVE / LOGS</p>
        <h1 className="mt-2 text-xl text-text">Sync activity</h1>
        <p className="mt-1 text-sm text-muted">Every sync run across your connections, newest first.</p>
      </header>

      <section className="term-panel">
        <div className="border-b border-edge px-4 py-3 text-sm text-text">
          log_stream<span className="text-dim"> // {runs.length}</span>
        </div>
        {runs.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">No sync activity yet.</p>
        ) : (
          <div className="divide-y divide-edge font-mono text-[12px]">
            {runs.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-2">
                <span className="w-40 shrink-0 text-dim">{ts(r.startedAt)}</span>
                <span className={`w-16 shrink-0 uppercase ${TONE[r.status] ?? "text-muted"}`}>{r.status}</span>
                <span className="w-28 shrink-0 text-text">{r.provider}</span>
                <span className="min-w-0 flex-1 truncate text-muted">{r.label}</span>
                <span className="shrink-0 text-dim">{r.resourcesSeen ?? 0} seen</span>
                {r.errorCode && <span className="shrink-0 text-down">{r.errorCode}</span>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
