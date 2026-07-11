"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Sidebar sections (doc/07). Items with an href are live routes; the rest are
// placeholders until their pages land, shown dimmed and non-clickable.
const SECTIONS: { title: string; items: { label: string; href?: string }[] }[] = [
  { title: "MAIN", items: [{ label: "Overview", href: "/" }, { label: "Connections", href: "/connections" }, { label: "Integrations", href: "/integrations" }, { label: "Alerts" }] },
  { title: "INFRA", items: [{ label: "Domains & DNS", href: "/domains" }, { label: "Databases" }, { label: "Websites" }, { label: "Servers" }] },
  { title: "OBSERVE", items: [{ label: "Git", href: "/git" }, { label: "Logs", href: "/logs" }] },
  { title: "SYSTEM", items: [{ label: "Settings" }] },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="px-1 pb-2 text-[10px] tracking-[0.3em] text-dim">[{section.title}]</p>
          <ul className="space-y-px">
            {section.items.map((item) => {
              const active = item.href === pathname;
              const base = "group flex items-center gap-2 border-l-2 px-2 py-1.5 text-[13px] transition-colors";

              if (!item.href) {
                return (
                  <li key={item.label} className={`${base} cursor-default border-transparent text-dim`}>
                    <span> </span>
                    {item.label}
                  </li>
                );
              }
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`${base} ${
                      active
                        ? "border-cyan bg-surface text-text"
                        : "border-transparent text-muted hover:border-edge-bright hover:text-text"
                    }`}
                  >
                    <span className={active ? "text-cyan" : "text-dim group-hover:text-muted"}>
                      {active ? "›" : " "}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
