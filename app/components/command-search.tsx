"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export type SearchAsset = {
  id: string;
  name: string;
  displayName: string | null;
  assetType: string;
  status: string | null;
  provider: string;
  accountLabel: string;
  accountId: string;
};

const STATUS_TONE: Record<string, string> = {
  active: "text-ok",
  ready: "text-ok",
  verified: "text-ok",
  public: "text-ok",
  degraded: "text-warn",
  building: "text-blue",
  queued: "text-blue",
  unverified: "text-warn",
  error: "text-down",
  offline: "text-down",
};

function tone(status: string | null) {
  return (status && STATUS_TONE[status]) || "text-muted";
}

export function CommandSearch({ assets }: { assets: SearchAsset[] }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => setMounted(true), []);
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [account, setAccount] = useState("all");

  // `/` opens, Esc closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(el?.tagName);
      if (e.key === "/" && !typing && !open) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const types = useMemo(() => [...new Set(assets.map((a) => a.assetType))].sort(), [assets]);
  const statuses = useMemo(() => [...new Set(assets.map((a) => a.status).filter(Boolean))].sort() as string[], [assets]);
  const accounts = useMemo(() => {
    const m = new Map<string, string>();
    assets.forEach((a) => m.set(a.accountId, a.accountLabel));
    return [...m.entries()];
  }, [assets]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return assets.filter((a) => {
      if (type !== "all" && a.assetType !== type) return false;
      if (status !== "all" && a.status !== status) return false;
      if (account !== "all" && a.accountId !== account) return false;
      if (needle && !`${a.name} ${a.displayName ?? ""} ${a.accountLabel}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [assets, q, type, status, account]);

  return (
    <>
      {/* trigger — looks like the terminal search line */}
      <button
        onClick={() => setOpen(true)}
        className="flex flex-1 items-center gap-2 border border-edge bg-panel px-3 py-1.5 text-left text-sm text-dim transition-colors hover:border-edge-bright"
      >
        <span>search</span>
        <span className="flex-1 truncate">assets, domains, projects…</span>
        <kbd className="border border-edge px-1.5 py-0.5 text-[10px]">/</kbd>
      </button>

      {!mounted || !open
        ? null
        : createPortal(
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-edge bg-panel">
            <div className="flex items-center gap-2 border-b border-edge px-4 py-3">
              <span className="text-cyan">/</span>
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="search all assets…"
                className="flex-1 bg-transparent text-sm text-text placeholder:text-dim focus:outline-none"
              />
              <button onClick={() => setOpen(false)} className="text-dim hover:text-text">
                esc
              </button>
            </div>

            {/* filters */}
            <div className="grid grid-cols-3 gap-2 border-b border-edge px-4 py-3 text-xs">
              <Select label="type" value={type} onChange={setType} options={types} />
              <Select label="status" value={status} onChange={setStatus} options={statuses} />
              <Select
                label="account"
                value={account}
                onChange={setAccount}
                options={accounts.map(([id]) => id)}
                render={(id) => accounts.find(([a]) => a === id)?.[1] ?? id}
              />
            </div>

            <div className="border-b border-edge px-4 py-1.5 text-[11px] text-dim">
              {results.length} of {assets.length}
            </div>

            <div className="flex-1 overflow-y-auto">
              {results.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted">No matches.</p>
              ) : (
                results.map((a) => (
                  <Link
                    key={a.id}
                    href={`/assets/${a.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 border-b border-edge/60 px-4 py-2.5 hover:bg-surface"
                  >
                    <span className={`text-xs ${tone(a.status)}`}>●</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-text">{a.displayName ?? a.name}</div>
                      <div className="truncate text-[11px] text-dim">
                        {a.assetType} · {a.provider} · {a.accountLabel}
                      </div>
                    </div>
                    <span className={`text-[11px] uppercase ${tone(a.status)}`}>{a.status ?? "—"}</span>
                  </Link>
                ))
              )}
            </div>
          </aside>
        </div>,
          document.body,
        )}
    </>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  render,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  render?: (v: string) => string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wide text-dim">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-edge bg-surface px-2 py-1 text-text focus:border-edge-bright focus:outline-none"
      >
        <option value="all">all</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {render ? render(o) : o}
          </option>
        ))}
      </select>
    </label>
  );
}
