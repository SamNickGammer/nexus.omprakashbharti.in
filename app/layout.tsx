import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./components/sidebar";
import { Topbar } from "./components/topbar";

export const metadata: Metadata = {
  title: "Nexus — ops cockpit",
  description: "Developer operations cockpit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
