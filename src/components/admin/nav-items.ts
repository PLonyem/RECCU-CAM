import {
  LayoutDashboard,
  Home,
  Newspaper,
  FolderOpen,
  Megaphone,
  Building2,
  ClipboardCheck,
  UserPlus,
  Mail,
  Settings,
  Bell,
  type LucideIcon,
} from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

export interface AdminNavItem {
  href: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
  /** Shows the live profile-review count sourced by Sidebar.tsx. */
  badge?: "affiliateReview";
}

export interface AdminNavGroup {
  labelKey: TranslationKey;
  items: AdminNavItem[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    labelKey: "admin.dashboard",
    items: [{ href: "/admin", labelKey: "admin.dashboard", icon: LayoutDashboard }],
  },
  {
    labelKey: "admin.websiteContent",
    items: [
      { href: "/admin/homepage", labelKey: "admin.homepageEditor", icon: Home },
      { href: "/admin/announcements", labelKey: "admin.announcementsManager", icon: Megaphone },
      { href: "/admin/news", labelKey: "admin.newsManager", icon: Newspaper },
      { href: "/admin/resources", labelKey: "admin.resourcesManager", icon: FolderOpen },
    ],
  },
  {
    labelKey: "admin.affiliates",
    items: [
      { href: "/admin/chapters", labelKey: "admin.chaptersCreditUnions", icon: Building2 },
      { href: "/admin/users/create", labelKey: "admin.createNewCreditUnion", icon: UserPlus },
      {
        href: "/admin/affiliates/review",
        labelKey: "admin.reviewProfiles",
        icon: ClipboardCheck,
        badge: "affiliateReview",
      },
    ],
  },
  {
    labelKey: "admin.messages",
    items: [{ href: "/admin/messages", labelKey: "admin.messages", icon: Mail }],
  },
  {
    labelKey: "admin.settings",
    items: [
      { href: "/admin/settings", labelKey: "admin.generalSettings", icon: Settings },
      { href: "/admin/settings/notifications", labelKey: "admin.notificationSettings", icon: Bell },
    ],
  },
];

// Flattened view for callers that don't care about section grouping.
export const adminNavItems: AdminNavItem[] = adminNavGroups.flatMap((group) => group.items);

export function isAdminNavItemActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

// Picking the most specific matching route keeps nested admin pages tied
// to the correct parent navigation item.
function bestMatchingNavItem(pathname: string): AdminNavItem | undefined {
  return adminNavItems
    .filter((item) => isAdminNavItemActive(pathname, item.href))
    .reduce<AdminNavItem | undefined>((best, item) => {
      if (!best || item.href.length > best.href.length) return item;
      return best;
    }, undefined);
}

export function getAdminPageTitleKey(pathname: string): TranslationKey {
  return bestMatchingNavItem(pathname)?.labelKey ?? "admin.dashboard";
}

// The single nav item Sidebar.tsx should render as highlighted for the
// current pathname — see bestMatchingNavItem above for why this can't just
// be "every item whose href is a prefix of pathname".
export function getActiveAdminNavHref(pathname: string): string | undefined {
  return bestMatchingNavItem(pathname)?.href;
}
