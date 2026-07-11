import { Sidebar } from "../components/sidebar";
import { Topbar } from "../components/topbar";
import { getSession } from "@/lib/auth";
import { listAllAssets } from "@/lib/connections";

// Authenticated dashboard shell. /login lives outside this group, so it
// renders on its own without the sidebar/topbar chrome.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const assets = session ? await listAllAssets(session.workspaceId) : [];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Topbar assets={assets} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
