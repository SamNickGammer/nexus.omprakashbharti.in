import { Sidebar } from "../components/sidebar";
import { Topbar } from "../components/topbar";

// Authenticated dashboard shell. /login lives outside this group, so it
// renders on its own without the sidebar/topbar chrome.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
