import Image from "next/image";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { signOut } from "@/app/actions";
import { Nav } from "./nav";

// Persistent left-nav. Terminal aesthetic: bracketed section headers,
// monospace items, live status strip at the foot.
export async function Sidebar() {
  const session = await getSession();
  const [ws] = session
    ? await db.select({ name: workspaces.name }).from(workspaces).where(eq(workspaces.id, session.workspaceId)).limit(1)
    : [];
  const wsName = ws?.name ?? "personal";

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
            <span className="text-text">{wsName.toLowerCase()}</span>
          </span>
          <span className="text-dim">⌄</span>
        </div>
      </div>

      {/* nav */}
      <Nav />

      {/* status strip */}
      <div className="border-t border-edge px-4 py-3 text-[11px]">
        <div className="flex items-center gap-2 text-muted">
          <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-ok text-ok" />
          <span>all systems operational</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-dim">
          <span>sync 0s ago · v0.1.0</span>
          <form action={signOut}>
            <button type="submit" className="text-dim transition-colors hover:text-down">
              exit
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
