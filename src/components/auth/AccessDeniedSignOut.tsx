"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

export function AccessDeniedSignOut() {
  const { signOut } = useClerk();

  return (
    <button
      type="button"
      onClick={() => void signOut({ redirectUrl: "/" })}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-institutional transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" /> Sign Out
    </button>
  );
}
