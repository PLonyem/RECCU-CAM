"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Bell, Menu } from "lucide-react";
import { getAdminPageDescription, getAdminPageTitle } from "./nav-items";
import { Badge } from "@/components/ui/Badge";
import { AUTH_PERMISSIONS, hasPermission, normalizeAuthRole, ROLE_LABELS } from "@/lib/auth/roles";

interface AdminNavbarProps {
  onMenuClick: () => void;
}

export function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const displayName = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Authorized staff";
  const role = normalizeAuthRole(user?.publicMetadata.role);
  const roleLabel = role ? ROLE_LABELS[role] : "Staff";
  const canViewMessages = hasPermission(role, AUTH_PERMISSIONS.manageMessages);

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-[4.5rem] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold text-institutional sm:text-lg">
              {getAdminPageTitle(pathname)}
            </p>
            <p className="hidden truncate text-xs text-slate-500 sm:block">
              {getAdminPageDescription(pathname)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {canViewMessages && (
            <Link href="/admin/messages" aria-label="Open message notifications" className="grid h-10 w-10 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-institutional focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest">
              <Bell className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}
          <div className="hidden min-w-0 text-right md:block">
            <p className="max-w-44 truncate text-sm font-semibold text-slate-800">{displayName}</p>
            <Badge variant="primary" className="mt-1 px-2 py-0 text-[9px]">{roleLabel}</Badge>
          </div>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
