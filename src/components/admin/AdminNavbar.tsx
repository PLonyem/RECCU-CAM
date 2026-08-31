"use client";

import { useUser } from "@clerk/nextjs";
import { Menu } from "lucide-react";

interface AdminNavbarProps {
  onMenuClick: () => void;
}

export function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  const { user } = useUser();
  const displayName = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "";
  const initial = (displayName || "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 h-16 shrink-0 border-b border-gray-200 bg-white">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
              {initial}
            </div>
            <span className="hidden max-w-48 truncate text-sm font-medium text-gray-700 sm:block">
              {displayName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
