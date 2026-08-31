"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Clock,
  User,
  FileText,
  AlertCircle,
  Phone,
  ClipboardList,
  Info,
  type LucideIcon,
} from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface AnnouncementDetail {
  label: string;
  value: string;
}

interface Announcement {
  id: string;
  title: string;
  opening: string;
  details: AnnouncementDetail[];
  category: string;
  priority: string;
  publishedAt: string | null;
}

const CATEGORY_BADGE_VARIANT: Record<string, NonNullable<BadgeProps["variant"]>> = {
  Announcement: "default",
  Circular: "primary",
  Training: "accent",
  COBAC: "warning",
  Event: "success",
};

// Matches the admin Announcements Manager's own priority dot colors, so
// severity reads the same way in both places.
const PRIORITY_DOT_COLOR: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  normal: "bg-blue-500",
  low: "bg-gray-400",
};

// Detail labels are admin free-text (see the Announcements Manager's
// datalist suggestions), so this matches loosely rather than requiring an
// exact set — "Registration Deadline" and "Deadline" both need to land on
// AlertCircle, which a plain lookup table keyed on the exact string
// wouldn't catch.
function iconForLabel(label: string): LucideIcon {
  const normalized = label.trim().toLowerCase();
  if (normalized === "date") return Calendar;
  if (normalized === "venue") return MapPin;
  if (normalized === "time") return Clock;
  if (normalized === "facilitator") return User;
  if (normalized === "topic") return FileText;
  if (normalized.includes("deadline")) return AlertCircle;
  if (normalized === "contact") return Phone;
  if (normalized === "requirements") return ClipboardList;
  return Info;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// The collapsed preview and the expanded body are two separately-toggled
// grid rows (each its own 0fr <-> 1fr transition) rather than one block
// whose content is swapped — line-clamp itself can't be animated (it isn't
// an interpolatable CSS property), but each row's *presence* can, so a
// simultaneous fade-out-preview / fade-in-full-content reads as one smooth
// expand instead of a hard cut.
function AnnouncementCard({
  item,
  isExpanded,
  onToggle,
}: {
  item: Announcement;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors duration-300",
        isExpanded ? "bg-primary-50/50 border-primary-200" : "bg-white border-gray-200"
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={cn("h-2 w-2 rounded-full shrink-0", PRIORITY_DOT_COLOR[item.priority] ?? "bg-gray-400")}
          aria-hidden="true"
        />
        <Badge variant={CATEGORY_BADGE_VARIANT[item.category] ?? "default"}>{item.category}</Badge>
      </div>

      <p className="font-bold text-lg text-gray-900">{item.title}</p>

      {/* Collapsed preview */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
          isExpanded ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
        )}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.opening}</p>
        </div>
      </div>

      {/* Expanded body: full opening + detail bullets */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-gray-600 mt-1">{item.opening}</p>

          {item.details.length > 0 && (
            <>
              <div className="border-t border-gray-100 my-2" />
              <div>
                {item.details.map((detail, index) => {
                  const Icon = iconForLabel(detail.label);
                  return (
                    <div key={index} className="flex items-start gap-3 py-1.5">
                      <Icon className="h-4 w-4 text-primary-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">
                        <span className="font-bold text-gray-900 mr-1">{detail.label}:</span>
                        <span className="text-gray-700">{detail.value}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {isExpanded && <div className="border-t border-gray-100 my-2" />}

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-bold text-gray-500">{formatDate(item.publishedAt)}</span>
        <button
          type="button"
          onClick={onToggle}
          className="text-sm text-primary-600 font-medium inline-flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              Show Less
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Read More
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function AnnouncementsFeed() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data: Announcement[]) => {
        if (ignore) return;
        setAnnouncements(data);
        setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="font-semibold text-lg text-gray-900">Announcements from CamCCUL</h2>

      {isLoading ? (
        <p className="mt-4 text-gray-400 text-sm">Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <p className="mt-4 text-gray-400 text-sm">No announcements from CamCCUL at this time.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {announcements.map((item) => (
            <AnnouncementCard
              key={item.id}
              item={item}
              isExpanded={expandedId === item.id}
              onToggle={() => toggleExpanded(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
