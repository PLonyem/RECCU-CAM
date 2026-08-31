"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNavGroups, getActiveAdminNavHref, type AdminNavItem } from "./nav-items";
import { useLanguage } from "@/context/LanguageContext";

interface SidebarProps {
  onNavigate?: () => void;
}

const BADGE_COLOR: Record<NonNullable<AdminNavItem["badge"]>, string> = {
  affiliateReview: "bg-primary-500",
};

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { t } = useLanguage();
  const [affiliateReviewCount, setAffiliateReviewCount] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;

    function refetchBadgeCounts() {
      fetch("/api/admin/affiliates/review/count")
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { pending: number } | null) => {
          if (!ignore && data) setAffiliateReviewCount(data.pending);
        })
        .catch(() => {});

    }

    refetchBadgeCounts();
    // Approving/rejecting on either review page doesn't change pathname
    // (it's the same page, just its own list refreshing), so that page
    // dispatches this event as the signal to also refetch here — without
    // it, a badge would only clear on the *next* navigation, not the
    // moment the thing it's counting was actually handled.
    window.addEventListener("admin-badge-refresh", refetchBadgeCounts);

    return () => {
      ignore = true;
      window.removeEventListener("admin-badge-refresh", refetchBadgeCounts);
    };
    // Also re-fetch whenever the admin navigates, as a fallback.
  }, [pathname]);

  const badgeCounts = { affiliateReview: affiliateReviewCount };
  const activeHref = getActiveAdminNavHref(pathname);

  return (
    <aside className="bg-gray-900 text-white h-full flex flex-col">
      <div className="flex flex-col items-center border-b border-gray-800 px-4 py-5 text-center">
        <div className="rounded-lg bg-white p-1 shadow-sm ring-1 ring-white/10">
          <Image
            src="/images/logo.jpg"
            alt="CamCCUL logo"
            width={56}
            height={68}
            priority
            className="block h-auto w-14 rounded-lg object-contain"
          />
        </div>
        <p className="mt-2 text-xs leading-tight text-gray-400">Admin Dashboard</p>
      </div>

      <nav className="mt-2 flex-1 overflow-y-auto px-3 pb-4">
        {adminNavGroups.map((group, groupIndex) => (
          <div key={`${group.labelKey}-${groupIndex}`}>
            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-3 mt-5 mb-2">
              {t(group.labelKey)}
            </p>
            <div className="space-y-1">
              {group.items.map(({ href, labelKey, icon: Icon, badge }) => {
                const isActive = href === activeHref;
                const count = badge ? badgeCounts[badge] : null;

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{t(labelKey)}</span>
                    {badge && !!count && (
                      <span
                        className={cn(
                          "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-white text-[10px] font-semibold",
                          BADGE_COLOR[badge]
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-800 px-4 py-4">
        <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
        <p className="text-xs text-gray-400 truncate">
          {user?.primaryEmailAddress?.emailAddress}
        </p>
        <Link
          href="/"
          className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("admin.backToWebsite")}
        </Link>
        <button
          onClick={() => signOut({ redirectUrl: "/login" })}
          className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
