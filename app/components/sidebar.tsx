// Persistent left-nav shell. Sections per PRD (doc/07-ui-ux-design.md).
// Static for now — routing/active-state lands with the real pages.

const SECTIONS: { title: string; items: string[] }[] = [
  { title: "MAIN", items: ["Overview", "Alerts", "Integrations"] },
  { title: "INFRASTRUCTURE", items: ["Domains & DNS", "Databases", "Websites", "Servers"] },
  { title: "OBSERVABILITY", items: ["Git", "Logs"] },
  { title: "SETTINGS", items: ["Settings"] },
];

export function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-edge bg-surface">
      <div className="flex items-center gap-2 border-b border-edge px-4 py-4">
        <div className="grid h-7 w-7 place-items-center rounded bg-accent font-bold text-black">
          N
        </div>
        <span className="font-semibold tracking-wide">NEXUS</span>
      </div>

      <div className="border-b border-edge px-4 py-3">
        <div className="rounded border border-edge bg-panel px-3 py-2 text-sm text-neutral-300">
          Personal workspace
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-2 pb-2 text-[11px] font-medium tracking-widest text-neutral-500">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="cursor-pointer rounded px-2 py-1.5 text-sm text-neutral-300 hover:bg-panel hover:text-white"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
