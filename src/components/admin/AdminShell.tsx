"use client";

import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { Sidebar } from "./Sidebar";
import { AdminNavbar } from "./AdminNavbar";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSessionTimeout />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 transition-transform duration-200 md:static md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminSessionTimeout() {
  const { signOut } = useClerk();

  useEffect(() => {
    let timer: number | undefined;
    let resetTimer: (() => void) | undefined;
    let disposed = false;
    const events: (keyof WindowEventMap)[] = ["mousedown", "keydown", "scroll", "touchstart"];

    fetch("/api/admin/settings/security", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((settings: { sessionTimeoutMinutes?: number } | null) => {
        if (disposed || !settings?.sessionTimeoutMinutes) return;
        const timeoutMs = settings.sessionTimeoutMinutes * 60_000;
        resetTimer = () => {
          if (timer) window.clearTimeout(timer);
          timer = window.setTimeout(() => {
            void signOut({ redirectUrl: "/login" });
          }, timeoutMs);
        };
        for (const event of events) window.addEventListener(event, resetTimer, { passive: true });
        resetTimer();
      })
      .catch(() => {});

    return () => {
      disposed = true;
      if (timer) window.clearTimeout(timer);
      if (resetTimer) {
        for (const event of events) window.removeEventListener(event, resetTimer);
      }
    };
  }, [signOut]);

  return null;
}
