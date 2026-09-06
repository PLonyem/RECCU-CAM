"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { ArrowLeft, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNavGroups, getActiveAdminNavHref, type AdminNavItem } from "./nav-items";
import { useLanguage } from "@/context/LanguageContext";
import { BrandMark } from "@/components/brand/BrandMark";
import { hasPermission } from "@/lib/auth/roles";
import { DEMO_ADMIN_IDENTITY, isDemoMode } from "@/lib/demo-mode";

interface SidebarProps {
  onNavigate?: () => void;
}

interface SidebarContentProps extends SidebarProps {
  demo: boolean;
  displayName: string;
  detail: string;
  role: unknown;
  onSignOut?: () => void;
}

const BADGE_COLOR: Record<NonNullable<AdminNavItem["badge"]>, string> = { messages: "bg-primary-500" };

export function Sidebar(props: SidebarProps) {
  if (isDemoMode()) {
    return (
      <SidebarContent
        {...props}
        demo
        displayName={DEMO_ADMIN_IDENTITY.name}
        detail={DEMO_ADMIN_IDENTITY.roleLabel}
        role={DEMO_ADMIN_IDENTITY.role}
      />
    );
  }

  return <AuthenticatedSidebar {...props} />;
}

function AuthenticatedSidebar(props: SidebarProps) {
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <SidebarContent
      {...props}
      demo={false}
      displayName={user?.fullName ?? "Authorized staff"}
      detail={user?.primaryEmailAddress?.emailAddress ?? "Authenticated with Clerk"}
      role={user?.publicMetadata.role}
      onSignOut={() => void signOut({ redirectUrl: "/sign-in" })}
    />
  );
}

function SidebarContent({ onNavigate, demo, displayName, detail, role, onSignOut }: SidebarContentProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [messageCount, setMessageCount] = useState<number | null>(null);

  useEffect(() => {
    if (demo) return;
    let ignore = false;

    function refetchBadgeCounts() {
      fetch("/api/admin/messages?status=unread&limit=1")
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { unreadCount: number } | null) => {
          if (!ignore && data) setMessageCount(data.unreadCount);
        })
        .catch(() => {});
    }

    refetchBadgeCounts();
    window.addEventListener("admin-badge-refresh", refetchBadgeCounts);

    return () => {
      ignore = true;
      window.removeEventListener("admin-badge-refresh", refetchBadgeCounts);
    };
  }, [demo, pathname]);

  const badgeCounts = { messages: messageCount };
  const activeHref = getActiveAdminNavHref(pathname);

  return (
    <aside className="flex h-full flex-col bg-gray-900 text-white">
      <div className="flex flex-col items-center border-b border-gray-800 px-4 py-5 text-center">
        <BrandMark className="h-12 w-12 bg-white text-primary-900" />
        <p className="mt-3 font-display text-sm font-bold text-white">RECCU-CAM</p>
        <p className="mt-1 text-xs leading-tight text-gray-400">Admin workspace</p>
        {demo && (
          <span className="mt-3 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-light">
            Proposal Preview
          </span>
        )}
      </div>

      <nav className="mt-2 flex-1 overflow-y-auto px-3 pb-4">
        {adminNavGroups.map((group, groupIndex) => {
          const visibleItems = group.items.filter((item) => hasPermission(role, item.permission));
          if (!visibleItems.length) return null;
          return (
            <div key={`${group.label}-${groupIndex}`}>
              <p className="mb-2 mt-5 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {group.label}
              </p>
              <div className="space-y-1">
                {visibleItems.map(({ href, label, icon: Icon, badge }) => {
                  const isActive = href === activeHref;
                  const count = badge ? badgeCounts[badge] : null;

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                        isActive
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{label}</span>
                      {badge && !!count && (
                        <span className={cn("inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white", BADGE_COLOR[badge])}>
                          {count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 px-4 py-4">
        <p className="truncate text-sm font-medium text-white">{displayName}</p>
        <p className="truncate text-xs text-gray-400">{detail}</p>
        <Link
          href="/"
          onClick={onNavigate}
          className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("admin.backToWebsite")}
        </Link>
        {!demo && onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
