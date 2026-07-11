import { CommandSearch, type SearchAsset } from "./command-search";

// Command bar. The search line opens a right-side panel over every asset
// across all connected accounts (press "/").
export function Topbar({ assets }: { assets: SearchAsset[] }) {
  const alerts = assets.filter((a) => a.status && ["error", "offline", "unverified", "degraded"].includes(a.status)).length;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-edge bg-bg/85 px-6 backdrop-blur">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-violet">nexus</span>
        <span className="text-dim">:</span>
        <span className="text-blue">~/personal</span>
        <span className="text-cyan">$</span>
      </div>

      <CommandSearch assets={assets} />

      <div className="hidden items-center gap-4 text-[11px] text-muted sm:flex">
        <span>
          <span className="text-dim">assets</span> {assets.length}
        </span>
        <span>
          <span className="text-dim">attention</span>{" "}
          <span className={alerts ? "text-down" : "text-ok"}>{alerts}</span>
        </span>
      </div>
    </header>
  );
}
