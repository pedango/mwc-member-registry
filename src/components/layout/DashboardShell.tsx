"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export function DashboardShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <SessionProvider>
      <div className="flex h-dvh overflow-hidden bg-mwc-surface">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Header userName={userName} onMenuClick={() => setOpen(true)} />
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 pb-10 md:px-6 md:py-8 lg:px-8">
            <div className="page-shell space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
