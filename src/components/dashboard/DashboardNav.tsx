"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Menu,
  X,
  Clock,
  Megaphone,
  FileCheck2,
  GraduationCap,
  Newspaper,
  FileText,
  Phone,
  Mail,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: DropdownItem[];
}

// Dashboard section links are prefixed with /dashboard so they resolve
// correctly from any portal page, not just from the home page itself.
const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Deadline Countdown", href: "/dashboard#deadline-countdown", icon: Clock },
      { label: "Announcements", href: "/dashboard#announcements", icon: Megaphone },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "COBAC Templates", href: "/resources?category=COBACRegulation", icon: FileCheck2 },
      { label: "Training Materials", href: "/resources?category=TrainingMaterial", icon: GraduationCap },
      { label: "Latest Circulars", href: "/news", icon: Newspaper },
      { label: "Important Forms", href: "/resources?category=Form", icon: FileText },
    ],
  },
  {
    label: "Help",
    items: [
      { label: "Call CamCCUL", href: "tel:+237233361182", icon: Phone },
      { label: "Email Support", href: "mailto:info@camccul.cm", icon: Mail },
      { label: "Send Message", href: "/contact", icon: MessageSquare },
    ],
  },
];

function isExternalHref(href: string) {
  return href.startsWith("tel:") || href.startsWith("mailto:");
}

// tel:/mailto: links skip next/link's client-side routing entirely (see
// UtilityBar/Footer/contact page for the same plain-<a> convention used
// sitewide), so those two schemes render as a plain anchor instead.
function DropdownLink({
  item,
  className,
  onNavigate,
}: {
  item: DropdownItem;
  className: string;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const content = (
    <>
      <Icon className="h-4 w-4 text-gray-400 transition-colors duration-150 group-hover:text-primary-600" />
      {item.label}
    </>
  );

  if (isExternalHref(item.href)) {
    return (
      <a href={item.href} className={className} onClick={onNavigate}>
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      {content}
    </Link>
  );
}

export function DashboardNav() {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMobileGroups, setExpandedMobileGroups] = useState<Record<string, boolean>>({});
  const closeTimerRef = useRef<number | null>(null);

  function cancelScheduledClose() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function handleMouseEnter(label: string) {
    cancelScheduledClose();
    setOpenLabel(label);
  }

  function handleMouseLeave() {
    closeTimerRef.current = window.setTimeout(() => setOpenLabel(null), 200);
  }

  function handleTriggerClick(label: string) {
    cancelScheduledClose();
    setOpenLabel((current) => (current === label ? null : label));
  }

  function toggleMobileGroup(label: string) {
    setExpandedMobileGroups((current) => ({ ...current, [label]: !current[label] }));
  }

  function closeMobile() {
    setIsMobileOpen(false);
  }

  // DashboardNav lives in the shared dashboard layout, so this only runs
  // once per real page load (a hard refresh, or first arrival), never on
  // in-app client-side navigation between dashboard pages — layouts don't
  // remount for those. A refresh with a leftover #section hash in the URL
  // from an earlier navigation click makes the browser scroll straight
  // back to that anchor
  // instead of the top; the browser's own one-time scroll-to-anchor has
  // already happened by the time this effect runs, so stripping the hash
  // here doesn't undo it — it just means the *next* refresh starts clean
  // instead of repeating the same jump forever. With no hash, some
  // browsers still restore the exact scroll offset on reload, so that case
  // gets an explicit reset to the top instead.
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-16 z-20">
      <div className="h-12 flex items-center gap-1 px-6">
        <div className="hidden md:flex items-center gap-1">
          {NAV_GROUPS.map((group) => (
            <div
              key={group.label}
              className="relative"
              onMouseEnter={() => handleMouseEnter(group.label)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => handleTriggerClick(group.label)}
                aria-expanded={openLabel === group.label}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg cursor-pointer flex items-center gap-1 transition-colors duration-150",
                  openLabel === group.label
                    ? "text-primary-600 bg-primary-50"
                    : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                )}
              >
                {group.label}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-150",
                    openLabel === group.label && "rotate-180"
                  )}
                />
              </button>

              {/* Always mounted (not conditionally rendered) so the fade +
                  slide-down actually animates on both open and close —
                  pointer-events-none while closed keeps it from intercepting
                  hover/click or catching tab focus while invisible. */}
              <div
                aria-hidden={openLabel !== group.label}
                className={cn(
                  "absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-48 py-2 z-50 transition-all duration-200",
                  openLabel === group.label
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 -translate-y-1 pointer-events-none"
                )}
              >
                {group.items.map((item) => (
                  <DropdownLink
                    key={item.label}
                    item={item}
                    onNavigate={() => setOpenLabel(null)}
                    className="group px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 flex items-center gap-2 transition-colors duration-150"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen((current) => !current)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileOpen}
          className="md:hidden ml-auto p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-50"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMobileOpen && (
        <div className="md:hidden border-t border-gray-200">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="border-b border-gray-100 last:border-b-0">
              <button
                type="button"
                onClick={() => toggleMobileGroup(group.label)}
                aria-expanded={!!expandedMobileGroups[group.label]}
                className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-gray-700"
              >
                {group.label}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    expandedMobileGroups[group.label] && "rotate-180"
                  )}
                />
              </button>

              {expandedMobileGroups[group.label] && (
                <div className="pb-2">
                  {group.items.map((item) => (
                    <DropdownLink
                      key={item.label}
                      item={item}
                      onNavigate={closeMobile}
                      className="group pl-10 pr-6 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 flex items-center gap-2 transition-colors duration-150"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
