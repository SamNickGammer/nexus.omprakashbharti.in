"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { RepoDetail } from "@/lib/connectors/github";

type Tab = "readme" | "commits" | "branches";

function shortDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function RepoTabs({ detail, defaultBranch }: { detail: RepoDetail; defaultBranch?: string }) {
  const [tab, setTab] = useState<Tab>("readme");

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "readme", label: "readme" },
    { key: "commits", label: "commits", count: detail.commits.length },
    { key: "branches", label: "branches", count: detail.branches.length },
  ];

  return (
    <section className="term-panel">
      <div className="flex border-b border-edge">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-r border-edge px-5 py-3 text-sm transition-colors ${
              tab === t.key ? "bg-surface text-cyan" : "text-muted hover:text-text"
            }`}
          >
            {t.label}
            {t.count != null && <span className="ml-1.5 text-dim">// {t.count}</span>}
          </button>
        ))}
      </div>

      {tab === "readme" && (
        <div className="p-6">
          {detail.readme ? (
            <div className="readme-md max-w-3xl text-[14px] leading-relaxed text-muted">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{detail.readme}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted">No README found in this repository.</p>
          )}
        </div>
      )}

      {tab === "commits" && (
        <div className="divide-y divide-edge">
          {detail.commits.length === 0 ? (
            <p className="px-6 py-6 text-sm text-muted">No commits available.</p>
          ) : (
            detail.commits.map((c) => (
              <a
                key={c.sha}
                href={c.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface"
              >
                {c.authorAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.authorAvatar} alt="" width={24} height={24} className="rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <span className="grid h-6 w-6 place-items-center rounded-full border border-edge text-[10px] text-dim">
                    {(c.authorLogin ?? "?").slice(0, 1)}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-[13px] text-text">{c.message}</span>
                <span className="text-[11px] text-dim">{c.authorLogin}</span>
                <span className="font-mono text-[11px] text-cyan">{c.sha}</span>
                <span className="w-24 text-right text-[11px] text-dim">{shortDate(c.date)}</span>
              </a>
            ))
          )}
        </div>
      )}

      {tab === "branches" && <BranchDiagram branches={detail.branches} defaultBranch={defaultBranch} />}
    </section>
  );
}

// Simplified branching diagram: default branch is the trunk, others diverge.
function BranchDiagram({
  branches,
  defaultBranch,
}: {
  branches: RepoDetail["branches"];
  defaultBranch?: string;
}) {
  if (branches.length === 0) return <p className="px-6 py-6 text-sm text-muted">No branches found.</p>;

  const def = branches.find((b) => b.name === defaultBranch) ?? branches[0];
  const others = branches.filter((b) => b.name !== def.name);
  const rowH = 46;
  const trunkX = 24;
  const nodeX = 120;
  const height = (others.length + 1) * rowH;

  return (
    <div className="overflow-x-auto p-6">
      <div className="relative" style={{ minHeight: height }}>
        <svg width="100%" height={height} className="absolute inset-0" style={{ overflow: "visible" }}>
          {/* trunk */}
          <line x1={trunkX} y1={rowH / 2} x2={trunkX} y2={height - rowH / 2} stroke="var(--cyan)" strokeWidth={2} opacity={0.5} />
          {others.map((_, i) => {
            const y = (i + 1) * rowH + rowH / 2;
            return (
              <path
                key={i}
                d={`M ${trunkX} ${rowH / 2 + i * rowH * 0} ${trunkX} ${y} Q ${trunkX} ${y} ${trunkX + 24} ${y} L ${nodeX} ${y}`}
                fill="none"
                stroke="var(--violet)"
                strokeWidth={1.5}
                opacity={0.5}
              />
            );
          })}
          {/* nodes */}
          <circle cx={trunkX} cy={rowH / 2} r={5} fill="var(--cyan)" />
          {others.map((_, i) => (
            <circle key={i} cx={nodeX} cy={(i + 1) * rowH + rowH / 2} r={4} fill="var(--violet)" />
          ))}
        </svg>

        <div className="relative">
          <Row y={0} x={trunkX + 16} name={def.name} sha={def.sha} isDefault protected={def.protected} />
          {others.map((b, i) => (
            <Row key={b.name} y={(i + 1) * rowH} x={nodeX + 14} name={b.name} sha={b.sha} protected={b.protected} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({
  y,
  x,
  name,
  sha,
  isDefault,
  protected: prot,
}: {
  y: number;
  x: number;
  name: string;
  sha: string;
  isDefault?: boolean;
  protected: boolean;
}) {
  return (
    <div className="absolute flex items-center gap-2" style={{ top: y, left: x, height: 46 }}>
      <span className={`text-sm ${isDefault ? "text-cyan" : "text-text"}`}>{name}</span>
      {isDefault && <span className="border border-cyan/40 px-1.5 text-[10px] uppercase text-cyan">default</span>}
      {prot && <span className="border border-edge px-1.5 text-[10px] uppercase text-dim">protected</span>}
      <span className="font-mono text-[11px] text-dim">{sha}</span>
    </div>
  );
}
