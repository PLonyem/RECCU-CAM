import {
  BookOpen, Building2, ClipboardList, GraduationCap, HandCoins, Headphones,
  Images, LayoutDashboard, Mail, Megaphone, Newspaper, PanelsTopLeft,
  ScrollText, Settings, ShieldCheck, Users, type LucideIcon,
} from "lucide-react";
import { AUTH_PERMISSIONS, type AuthPermission } from "@/lib/auth/roles";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: AuthPermission;
  badge?: "messages";
}

export interface AdminNavGroup { label: string; items: AdminNavItem[]; }

export const adminNavGroups: AdminNavGroup[] = [
  { label: "Control center", items: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: AUTH_PERMISSIONS.accessAdmin },
    { href: "/admin/content", label: "Website Content", icon: PanelsTopLeft, permission: AUTH_PERMISSIONS.manageContent },
    { href: "/admin/messages", label: "Messages", icon: Mail, permission: AUTH_PERMISSIONS.manageMessages, badge: "messages" },
  ] },
  { label: "Network operations", items: [
    { href: "/admin/affiliates", label: "Affiliates", icon: Building2, permission: AUTH_PERMISSIONS.manageNetwork },
    { href: "/admin/affiliation-requests", label: "Affiliation Requests", icon: ClipboardList, permission: AUTH_PERMISSIONS.manageAffiliationRequests },
    { href: "/admin/affiliate-banking", label: "Affiliate Banking", icon: HandCoins, permission: AUTH_PERMISSIONS.manageAffiliateBanking },
    { href: "/admin/support", label: "Support Requests", icon: Headphones, permission: AUTH_PERMISSIONS.manageSupport },
  ] },
  { label: "Publishing & programmes", items: [
    { href: "/admin/news", label: "News & Events", icon: Newspaper, permission: AUTH_PERMISSIONS.manageNews },
    { href: "/admin/notices", label: "Notices", icon: Megaphone, permission: AUTH_PERMISSIONS.manageNotices },
    { href: "/admin/vtime", label: "VTIME", icon: GraduationCap, permission: AUTH_PERMISSIONS.manageTraining },
    { href: "/admin/knowledge", label: "Knowledge Centre", icon: BookOpen, permission: AUTH_PERMISSIONS.manageKnowledge },
    { href: "/admin/compliance", label: "Compliance", icon: ShieldCheck, permission: AUTH_PERMISSIONS.manageCompliance },
    { href: "/admin/media", label: "Media Library", icon: Images, permission: AUTH_PERMISSIONS.manageMedia },
  ] },
  { label: "Governance", items: [
    { href: "/admin/users", label: "Users & Roles", icon: Users, permission: AUTH_PERMISSIONS.manageUsers },
    { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText, permission: AUTH_PERMISSIONS.viewAuditLog },
    { href: "/admin/settings", label: "Settings", icon: Settings, permission: AUTH_PERMISSIONS.manageSettings },
  ] },
];

export const adminNavItems = adminNavGroups.flatMap((group) => group.items);
export function isAdminNavItemActive(pathname: string, href: string) { return href === "/admin" ? pathname === href : pathname.startsWith(href); }
function bestMatchingNavItem(pathname: string) { return adminNavItems.filter((item) => isAdminNavItemActive(pathname, item.href)).sort((a, b) => b.href.length - a.href.length)[0]; }
export function getAdminPageTitle(pathname: string) { return bestMatchingNavItem(pathname)?.label ?? "Dashboard"; }
export function getActiveAdminNavHref(pathname: string) { return bestMatchingNavItem(pathname)?.href; }
