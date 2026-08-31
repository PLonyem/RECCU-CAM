"use client";

import { Fragment, useEffect, useState } from "react";
import {
  ChevronDown,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { regions, regionLabels } from "@/lib/mock-data";
import { RejectDialog } from "./RejectDialog";

interface DocumentSummary {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  createdAt: string;
}

interface ReviewChapter {
  id: string;
  code: string;
  name: string;
  region: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  profileStatus: string | null;
  profileReviewNote: string | null;
  profileUpdatedAt: string | null;
  yearEstablished: number | null;
  briefHistory: string | null;
  totalMembers: number | null;
  branchCount: number | null;
  memberCreditUnionCount: number | null;
  services: string[];
  chapterPresident: string | null;
  chapterSupervisor: string | null;
  boardSize: number | null;
  staffCount: number | null;
  memberCreditUnions: unknown;
  documents: DocumentSummary[];
}

interface Counts {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function statusLabel(status: string | null): string {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending Review";
}

function statusVariant(status: string | null): "success" | "danger" | "warning" {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  return "warning";
}

function chapterLabelFor(region: string): string {
  return `${regionLabels[region]?.en ?? region} Chapter`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Small label + value pair used throughout the expanded profile sections
// below — kept local since nowhere else in the admin needs this exact
// "label above, value below, hide entirely when empty" shape.
function Field({ label, value }: { label: string; value: React.ReactNode | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-800">{value}</dd>
    </div>
  );
}

export default function ChapterReviewPage() {
  const [chapters, setChapters] = useState<ReviewChapter[]>([]);
  const [counts, setCounts] = useState<Counts>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ReviewChapter | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  // Flags a reload whenever the effective request (filters + manual
  // refresh) changes — adjusted during render, matching the pattern used
  // by the Affiliates admin list, so the effect below never has to call
  // setIsLoading(true) synchronously on entry.
  const requestKey = `${statusFilter}|${regionFilter}|${refreshToken}`;
  const [prevRequestKey, setPrevRequestKey] = useState(requestKey);
  if (requestKey !== prevRequestKey) {
    setPrevRequestKey(requestKey);
    setIsLoading(true);
  }

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (regionFilter) params.set("region", regionFilter);

    fetch(`/api/admin/affiliates/review?${params.toString()}`)
      .then((res) => res.json())
      .then((data: { chapters: ReviewChapter[]; counts: Counts }) => {
        if (ignore) return;
        setChapters(data.chapters);
        setCounts(data.counts);
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [statusFilter, regionFilter, refreshToken]);

  // Auto-dismiss the toast a few seconds after it appears.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function runAction(
    chapter: ReviewChapter,
    action: "approve" | "reject",
    reason?: string | null
  ) {
    setActioningId(chapter.id);
    const res = await fetch(`/api/admin/affiliates/review/${chapter.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason: reason ?? null }),
    });
    setActioningId(null);

    if (!res.ok) {
      setToast("Something went wrong. Please try again.");
      return;
    }

    setToast(
      action === "approve"
        ? "Profile approved. It is now live on the website."
        : "Profile rejected."
    );
    setRefreshToken((t) => t + 1);
    window.dispatchEvent(new Event("admin-badge-refresh"));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Credit Union Profiles</h1>
        <p className="text-sm text-gray-600 mt-1">
          Approve or reject profile submissions. Approved profiles appear on the public website
          automatically.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                statusFilter === tab.value
                  ? "bg-primary-500 border-primary-500 text-white"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              {tab.label}
              {tab.value && (
                <span className="ml-1.5 opacity-80">
                  ({counts[tab.value as keyof Omit<Counts, "total">]})
                </span>
              )}
            </button>
          ))}
        </div>

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="ml-auto border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        >
          <option value="">All Chapters</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {chapterLabelFor(region)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          Loading...
        </div>
      ) : chapters.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          No credit union profiles found for this filter.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-10 px-4 py-3" />
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Code</th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Credit Union Name</th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Chapter</th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Submitted At</th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Status</th>
                  <th className="text-right font-medium text-gray-500 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {chapters.map((chapter) => {
                  const isExpanded = expandedId === chapter.id;
                  const isActioning = actioningId === chapter.id;
                  const document = chapter.documents[0] ?? null;

                  return (
                    <Fragment key={chapter.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : chapter.id)}
                            aria-expanded={isExpanded}
                            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors"
                          >
                            <ChevronDown
                              className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")}
                            />
                            Review
                          </button>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{chapter.code}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">{chapter.name}</td>
                        <td className="px-4 py-3">
                          <Badge variant="primary">{chapterLabelFor(chapter.region)}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(chapter.profileUpdatedAt)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant(chapter.profileStatus)}>
                            {statusLabel(chapter.profileStatus)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {chapter.profileStatus === "approved" || chapter.profileStatus === "rejected" ? (
                              <span className="text-xs text-gray-400">No action needed</span>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="border-green-300 text-green-700 hover:bg-green-50"
                                  disabled={isActioning}
                                  onClick={() => runAction(chapter, "approve")}
                                >
                                  {isActioning ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  )}
                                  {isActioning ? "Approving..." : "Approve"}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                  disabled={isActioning}
                                  onClick={() => setRejectTarget(chapter)}
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td />
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-6">
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    About
                                  </p>
                                  <dl className="space-y-1.5">
                                    <Field label="Brief History" value={chapter.briefHistory} />
                                    <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                                      <Field label="Year Founded" value={chapter.yearEstablished} />
                                      <Field label="Number of Members" value={chapter.totalMembers} />
                                      <Field label="Number of Branches" value={chapter.branchCount} />
                                    </div>
                                  </dl>
                                </div>

                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Contact
                                  </p>
                                  {chapter.phone || chapter.email || chapter.address ? (
                                    <div className="space-y-1.5 text-sm text-gray-800">
                                      {chapter.phone && (
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                          {chapter.phone}
                                        </div>
                                      )}
                                      {chapter.email && (
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                          {chapter.email}
                                        </div>
                                      )}
                                      {chapter.address && (
                                        <div className="flex items-center gap-2">
                                          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                          {chapter.address}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-400">No contact details submitted.</p>
                                  )}
                                </div>

                                {chapter.services.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                      Services
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {chapter.services.map((service) => (
                                        <Badge key={service} variant="primary">
                                          {service}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Leadership
                                  </p>
                                  <dl className="flex flex-wrap gap-x-8 gap-y-1.5">
                                    <Field label="Board Chairperson" value={chapter.chapterPresident} />
                                    <Field label="General Manager" value={chapter.chapterSupervisor} />
                                    <Field label="Number of Board Members" value={chapter.boardSize} />
                                    <Field label="Number of Staff" value={chapter.staffCount} />
                                  </dl>
                                </div>
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                  Uploaded Document
                                </p>
                                {document ? (
                                  <div className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileText className="h-4 w-4 text-primary-500 shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-sm text-gray-900 truncate">{document.fileName}</p>
                                        <p className="text-xs text-gray-500">
                                          {formatFileSize(document.fileSize)} · {formatDate(document.createdAt)}
                                        </p>
                                      </div>
                                    </div>
                                    <a
                                      href={`/api/admin/affiliates/${chapter.id}/document`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 shrink-0"
                                    >
                                      View
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    No document uploaded — profile submitted via the online form.
                                  </p>
                                )}

                                {chapter.profileStatus === "rejected" && chapter.profileReviewNote && (
                                  <div className="mt-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                      Rejection Note
                                    </p>
                                    <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-3">
                                      {chapter.profileReviewNote}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <RejectDialog
        open={!!rejectTarget}
        creditUnionName={rejectTarget?.name ?? null}
        isSubmitting={actioningId === rejectTarget?.id}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        onConfirm={async (note) => {
          if (!rejectTarget) return;
          await runAction(rejectTarget, "reject", note.trim() || null);
          setRejectTarget(null);
        }}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
