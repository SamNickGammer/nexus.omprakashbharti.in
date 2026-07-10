import Image from "next/image";

// Persistent left-nav. Terminal aesthetic: bracketed section headers,
// monospace items, live status strip at the foot. Sections per doc/07.
const SECTIONS: { title: string; items: { label: string; active?: boolean }[] }[] = [
  { title: "MAIN", items: [{ label: "Overview", active: true }, { label: "Alerts" }, { label: "Integrations" }] },
  { title: "INFRA", items: [{ label: "Domains & DNS" }, { label: "Databases" }, { label: "Websites" }, { label: "Servers" }] },
  { title: "OBSERVE", items: [{ label: "Git" }, { label: "Logs" }] },
  { title: "SYSTEM", items: [{ label: "Settings" }] },
];

export function Sidebar() {
  return (
    <aside className="relative z-10 flex w-64 shrink-0 flex-col border-r border-edge bg-panel/80 backdrop-blur">
      {/* brand */}
      <div className="flex items-center gap-3 border-b border-edge px-4 py-4">
        <Image src="/logo_withoutname.png" alt="Nexus" width={30} height={30} priority />
        <span className="grad-text text-lg font-bold tracking-[0.25em]">NEXUS</span>
      </div>

      {/* workspace switcher */}
      <div className="border-b border-edge px-4 py-3">
        <div className="flex items-center justify-between border border-edge bg-surface px-3 py-2 text-xs">
          <span className="text-muted">
            <span className="text-dim">ws/</span>
            <span className="text-text">personal</span>
          </span>
          <span className="text-dim">⌄</span>
        </div>
      </div>

      {/* nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-1 pb-2 text-[10px] tracking-[0.3em] text-dim">
              [{section.title}]
            </p>
            <ul className="space-y-px">
              {section.items.map((item) => (
                <li
                  key={item.label}
                  className={`group flex cursor-pointer items-center gap-2 border-l-2 px-2 py-1.5 text-[13px] transition-colors ${
                    item.active
                      ? "border-cyan bg-surface text-text"
                      : "border-transparent text-muted hover:border-edge-bright hover:text-text"
                  }`}
                >
                  <span className={item.active ? "text-cyan" : "text-dim group-hover:text-muted"}>
                    {item.active ? "›" : " "}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* status strip */}
      <div className="border-t border-edge px-4 py-3 text-[11px]">
        <div className="flex items-center gap-2 text-muted">
          <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-ok text-ok" />
          <span>all systems operational</span>
        </div>
        <p className="mt-1 text-dim">sync 0s ago · v0.1.0</p>
      </div>
    </aside>
  );
}
