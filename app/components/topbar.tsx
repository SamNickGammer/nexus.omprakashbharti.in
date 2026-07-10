// Command bar styled as a shell prompt. The search input reads as a live
// terminal line — the page's persistent "you are here / type a command" moment.
export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-edge bg-bg/85 px-6 backdrop-blur">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-violet">nexus</span>
        <span className="text-dim">:</span>
        <span className="text-blue">~/personal</span>
        <span className="text-cyan">$</span>
      </div>

      <div className="flex flex-1 items-center gap-2 border border-edge bg-panel px-3 py-1.5 text-sm focus-within:border-edge-bright">
        <span className="text-dim">search</span>
        <input
          aria-label="Search assets, IPs, or clusters"
          placeholder="assets, ips, or clusters…"
          className="flex-1 bg-transparent text-text placeholder:text-dim focus:outline-none"
        />
        <kbd className="border border-edge px-1.5 py-0.5 text-[10px] text-dim">/</kbd>
      </div>

      <div className="hidden items-center gap-4 text-[11px] text-muted sm:flex">
        <span>
          <span className="text-dim">alerts</span> <span className="text-down">5</span>
        </span>
        <span>
          <span className="text-dim">region</span> blr-1
        </span>
      </div>
    </header>
  );
}
