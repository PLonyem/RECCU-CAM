"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeProps } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { regions, regionLabels } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { AnnouncementDetail } from "@/lib/validation/announcement";

interface AnnouncementRow {
  id: string;
  title: string;
  opening: string;
  details: AnnouncementDetail[];
  category: string;
  priority: string;
  targetChapter: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// Suggestions for the detail-row label input — matches the icon mapping in
// AnnouncementsFeed.tsx so an admin picking one of these sees the right
// icon show up on the dashboard, but the field stays free-text since a
// label outside this set still renders fine (falls back to a generic icon).
const DETAIL_LABEL_SUGGESTIONS = [
  "Date",
  "Venue",
  "Time",
  "Facilitator",
  "Topic",
  "Deadline",
  "Registration Deadline",
  "Contact",
  "Requirements",
];

const CATEGORIES = ["Circular", "Training", "COBAC", "Announcement", "Event"];
const PRIORITIES: { value: string; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];
// Same "<Region> Chapter" shape Affiliate.chapter actually stores (see
// ChapterCombobox's chapterLabelFor) — admin UI stays English-only.
const TARGET_CHAPTERS = regions.map((region) => `${regionLabels[region]?.en ?? region} Chapter`);

const PRIORITY_DOT_COLOR: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  normal: "bg-blue-500",
  low: "bg-gray-400",
};

const CATEGORY_BADGE_VARIANT: Record<string, NonNullable<BadgeProps["variant"]>> = {
  Circular: "primary",
  Training: "accent",
  COBAC: "warning",
  Announcement: "default",
  Event: "success",
};

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
const errorClass = "text-xs text-red-600 mt-1";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface FormState {
  title: string;
  opening: string;
  details: AnnouncementDetail[];
  category: string;
  priority: string;
  targetChapter: string; // "" = All Chapters
  expiryDate: string; // yyyy-mm-dd, "" = none
}

const EMPTY_FORM: FormState = {
  title: "",
  opening: "",
  details: [],
  category: CATEGORIES[0],
  priority: "normal",
  targetChapter: "",
  expiryDate: "",
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AnnouncementRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let ignore = false;
    // isLoading starts true (see useState above) for the very first fetch;
    // later refetches triggered by refreshToken update the list in place
    // without blanking the page again — the toast already covers feedback
    // for those.
    fetch("/api/admin/announcements")
      .then((res) => res.json())
      .then((data: AnnouncementRow[]) => {
        if (ignore) return;
        setAnnouncements(data);
        setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [refreshToken]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const active = announcements.filter((a) => a.isPublished);
  const drafts = announcements.filter((a) => !a.isPublished);

  function openCreateModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setIsModalOpen(true);
  }

  function openEditModal(announcement: AnnouncementRow) {
    setEditingId(announcement.id);
    setForm({
      title: announcement.title,
      opening: announcement.opening,
      details: announcement.details,
      category: announcement.category,
      priority: announcement.priority,
      targetChapter: announcement.targetChapter ?? "",
      expiryDate: announcement.expiryDate ? announcement.expiryDate.slice(0, 10) : "",
    });
    setFieldErrors({});
    setIsModalOpen(true);
  }

  function addDetailRow() {
    setForm((f) => ({ ...f, details: [...f.details, { label: "", value: "" }] }));
  }

  function updateDetailRow(index: number, field: "label" | "value", value: string) {
    setForm((f) => ({
      ...f,
      details: f.details.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    }));
  }

  function removeDetailRow(index: number) {
    setForm((f) => ({ ...f, details: f.details.filter((_, i) => i !== index) }));
  }

  async function handleSave(isPublished: boolean) {
    setIsSaving(true);
    setFieldErrors({});

    const payload = {
      title: form.title,
      opening: form.opening,
      // Rows an admin added but never actually filled in (both sides still
      // blank) are dropped silently rather than tripping the "label is
      // required" validation error on a row nobody meant to keep.
      details: form.details.filter((d) => d.label.trim() || d.value.trim()),
      category: form.category,
      priority: form.priority,
      targetChapter: form.targetChapter || null,
      expiryDate: form.expiryDate || null,
      isPublished,
    };

    const url = editingId ? `/api/admin/announcements/${editingId}` : "/api/admin/announcements";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => null);
    setIsSaving(false);

    if (!res.ok) {
      const details = body?.details?.fieldErrors as Record<string, string[] | undefined> | undefined;
      const nextErrors: Record<string, string> = {};
      if (details) {
        for (const [field, messages] of Object.entries(details)) {
          if (messages?.[0]) nextErrors[field] = messages[0];
        }
      }
      setFieldErrors(nextErrors);
      setToast({ type: "error", message: body?.error ?? "Could not save announcement." });
      return;
    }

    setIsModalOpen(false);
    setToast({ type: "success", message: isPublished ? "Announcement published." : "Saved as draft." });
    setRefreshToken((t) => t + 1);
  }

  async function togglePublish(announcement: AnnouncementRow, isPublished: boolean) {
    await fetch(`/api/admin/announcements/${announcement.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished }),
    });
    setToast({
      type: "success",
      message: isPublished ? "Announcement published." : "Announcement unpublished.",
    });
    setRefreshToken((t) => t + 1);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await fetch(`/api/admin/announcements/${deleteTarget.id}`, { method: "DELETE" });
    setIsDeleting(false);
    setDeleteTarget(null);
    setToast({ type: "success", message: "Announcement deleted." });
    setRefreshToken((t) => t + 1);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Announcements Manager</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage announcements that appear on credit union dashboards.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Create New Announcement
        </Button>
      </div>

      {toast && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-3 text-sm",
            toast.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          Loading…
        </div>
      ) : (
        <>
          <section>
            <h2 className="font-semibold text-lg text-gray-900 mb-4">
              Active Announcements ({active.length})
            </h2>
            {active.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
                No active announcements. Create one to notify credit unions.
              </div>
            ) : (
              <div className="space-y-3">
                {active.map((announcement) => (
                  <Card key={announcement.id} className="p-5">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-1.5 h-2.5 w-2.5 rounded-full shrink-0",
                          PRIORITY_DOT_COLOR[announcement.priority] ?? "bg-gray-400"
                        )}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <Badge variant={CATEGORY_BADGE_VARIANT[announcement.category] ?? "default"}>
                            {announcement.category}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            Published {formatDate(announcement.publishedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{announcement.opening}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <button
                            type="button"
                            onClick={() => openEditModal(announcement)}
                            className="text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePublish(announcement, false)}
                            className="text-xs font-medium text-gray-500 hover:text-amber-600 transition-colors"
                          >
                            Unpublish
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(announcement)}
                            className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-semibold text-lg text-gray-900 mb-4">
              Draft Announcements ({drafts.length})
            </h2>
            {drafts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
                No drafts.
              </div>
            ) : (
              <div className="space-y-3">
                {drafts.map((announcement) => (
                  <Card key={announcement.id} className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <Badge variant={CATEGORY_BADGE_VARIANT[announcement.category] ?? "default"}>
                            {announcement.category}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            Created {formatDate(announcement.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditModal(announcement)}
                          className="text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePublish(announcement, true)}
                          className="text-xs font-medium text-gray-500 hover:text-green-600 transition-colors"
                        >
                          Publish
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(announcement)}
                          className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Announcement" : "Create New Announcement"}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="ann-title" className={labelClass}>
                  Title
                </label>
                <input
                  id="ann-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputClass}
                  disabled={isSaving}
                />
                {fieldErrors.title && <p className={errorClass}>{fieldErrors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ann-category" className={labelClass}>
                    Category
                  </label>
                  <select
                    id="ann-category"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className={inputClass}
                    disabled={isSaving}
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ann-priority" className={labelClass}>
                    Priority
                  </label>
                  <select
                    id="ann-priority"
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                    className={inputClass}
                    disabled={isSaving}
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="ann-opening" className={labelClass}>
                  Opening Message
                </label>
                <textarea
                  id="ann-opening"
                  rows={3}
                  placeholder="Dear Colleagues, We are pleased to announce..."
                  value={form.opening}
                  onChange={(e) => setForm((f) => ({ ...f, opening: e.target.value }))}
                  className={inputClass}
                  disabled={isSaving}
                />
                {fieldErrors.opening && <p className={errorClass}>{fieldErrors.opening}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass}>Details</label>
                  <button
                    type="button"
                    onClick={addDetailRow}
                    disabled={isSaving}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Detail
                  </button>
                </div>
                {form.details.length === 0 ? (
                  <p className="text-xs text-gray-400">No details added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {form.details.map((detail, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          list="ann-detail-label-suggestions"
                          placeholder="Label (e.g. Date)"
                          value={detail.label}
                          onChange={(e) => updateDetailRow(index, "label", e.target.value)}
                          className={cn(inputClass, "flex-1 min-w-0")}
                          disabled={isSaving}
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. September 12, 2026)"
                          value={detail.value}
                          onChange={(e) => updateDetailRow(index, "value", e.target.value)}
                          className={cn(inputClass, "flex-[2] min-w-0")}
                          disabled={isSaving}
                        />
                        <button
                          type="button"
                          onClick={() => removeDetailRow(index)}
                          disabled={isSaving}
                          aria-label="Remove detail"
                          className="text-gray-400 hover:text-red-600 transition-colors shrink-0 disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <datalist id="ann-detail-label-suggestions">
                  {DETAIL_LABEL_SUGGESTIONS.map((label) => (
                    <option key={label} value={label} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ann-chapter" className={labelClass}>
                    Target Chapter
                  </label>
                  <select
                    id="ann-chapter"
                    value={form.targetChapter}
                    onChange={(e) => setForm((f) => ({ ...f, targetChapter: e.target.value }))}
                    className={inputClass}
                    disabled={isSaving}
                  >
                    <option value="">All Chapters</option>
                    {TARGET_CHAPTERS.map((chapter) => (
                      <option key={chapter} value={chapter}>
                        {chapter}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ann-expiry" className={labelClass}>
                    Expiry Date <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="ann-expiry"
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                    className={inputClass}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Dialog.Close asChild>
                <Button variant="outline" disabled={isSaving}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
                Save as Draft
              </Button>
              <Button onClick={() => handleSave(true)} disabled={isSaving}>
                Publish Now
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete announcement?"
        description={`This will permanently delete "${deleteTarget?.title ?? ""}". This action cannot be undone.`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
