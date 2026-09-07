"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Copy,
  Download,
  FileText,
  Filter,
  Inbox,
  Mail,
  MailOpen,
  MessageSquareText,
  MoreHorizontal,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Star,
  UserCheck,
  X,
} from "lucide-react";
import { contactPurposeOptions } from "@/data/contact";
import {
  MESSAGE_PRIORITIES,
  MESSAGE_RESPONSE_METHODS,
  MESSAGE_SORTS,
  MESSAGE_STATUSES,
  type MessageFolder,
  type MessagePriority,
  type MessageSort,
  type MessageStatus,
} from "@/lib/message-inbox";
import { requestAdminData } from "@/lib/admin-data-client";
import { cn } from "@/lib/utils";

interface MessageListRow {
  id: string;
  referenceNumber: string;
  name: string;
  organization: string | null;
  purpose: string;
  department: string;
  subject: string;
  preview: string;
  status: string;
  priority: string;
  isRead: boolean;
  assignedUserId: string | null;
  assignedTo: string | null;
  archivedAt: string | null;
  respondedAt: string | null;
  responseDueAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MessageListResponse {
  messages: MessageListRow[];
  summary: { unread: number; needsResponse: number; highPriority: number; resolved: number; archived: number };
  purposeCounts: Record<string, number>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

interface MessageNote {
  id: string;
  authorUserId: string;
  body: string;
  createdAt: string;
}

interface MessageActivity {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface MessageDetail extends Omit<MessageListRow, "preview"> {
  phone: string | null;
  email: string | null;
  role: string | null;
  message: string;
  consent: boolean;
  readAt: string | null;
  respondedBy: string | null;
  responseMethod: string | null;
  responseNote: string | null;
  notes: MessageNote[];
}

interface MessageDetailResponse {
  message: MessageDetail;
  activity: MessageActivity[];
}

interface Assignee {
  id: string;
  name: string;
  role: string;
}

interface InboxFilters {
  folder: MessageFolder;
  status: MessageStatus | "";
  purpose: string;
  priority: MessagePriority | "";
  assignedUserId: string;
  read: "" | "read" | "unread";
  dateFrom: string;
  dateTo: string;
  sort: MessageSort;
  page: number;
}

const EMPTY_SUMMARY = { unread: 0, needsResponse: 0, highPriority: 0, resolved: 0, archived: 0 };
const INITIAL_FILTERS: InboxFilters = {
  folder: "inbox",
  status: "",
  purpose: "",
  priority: "",
  assignedUserId: "",
  read: "",
  dateFrom: "",
  dateTo: "",
  sort: "newest",
  page: 1,
};

const FOLDERS: Array<{ value: MessageFolder; label: string; icon: typeof Inbox; count?: keyof typeof EMPTY_SUMMARY }> = [
  { value: "inbox", label: "Inbox", icon: Inbox },
  { value: "unread", label: "Unread", icon: Mail, count: "unread" },
  { value: "needs-response", label: "Needs Response", icon: Clock3, count: "needsResponse" },
  { value: "assigned-to-me", label: "Assigned to Me", icon: UserCheck },
  { value: "high-priority", label: "High Priority", icon: Star, count: "highPriority" },
  { value: "resolved", label: "Resolved", icon: CheckCheck, count: "resolved" },
  { value: "archived", label: "Archived", icon: Archive, count: "archived" },
];

const fieldClass = "min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100";
const actionClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest disabled:cursor-not-allowed disabled:opacity-50";

export function MessagesInbox({ initialFolder = "inbox", initialMessageId }: { initialFolder?: MessageFolder; initialMessageId?: string }) {
  const [filters, setFilters] = useState<InboxFilters>(() => ({ ...INITIAL_FILTERS, folder: initialFolder }));
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState<MessageListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(initialMessageId ?? null);
  const [detail, setDetail] = useState<MessageDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [note, setNote] = useState("");
  const [responseMethod, setResponseMethod] = useState("email");
  const [responseNote, setResponseNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentTime] = useState(() => Date.now());
  const initialDetailLoaded = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ folder: filters.folder, sort: filters.sort, page: String(filters.page), limit: "25" });
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (filters.status) params.set("status", filters.status);
    if (filters.purpose) params.set("purpose", filters.purpose);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.assignedUserId) params.set("assignedUserId", filters.assignedUserId);
    if (filters.read) params.set("read", filters.read);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    return params.toString();
  }, [debouncedSearch, filters]);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    const result = await requestAdminData<MessageListResponse>(`/api/admin/messages?${queryString}`, { cache: "no-store" });
    if (!result.ok) {
      setLoadError(true);
      setLoading(false);
      return;
    }
    setData(result.data);
    setSelectedIds(new Set());
    setLoading(false);
  }, [queryString]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadMessages(), 0);
    return () => window.clearTimeout(timer);
  }, [loadMessages, refreshKey]);

  useEffect(() => {
    let ignore = false;
    void requestAdminData<{ assignees: Assignee[]; currentUserId: string }>("/api/admin/messages/assignees", { cache: "no-store" })
      .then((result) => {
        if (!ignore && result.ok) {
          setAssignees(result.data.assignees);
          setCurrentUserId(result.data.currentUserId);
        }
      });
    return () => { ignore = true; };
  }, []);

  const loadDetail = useCallback(async (id: string, markRead = true) => {
    setDetailLoading(true);
    const result = await requestAdminData<MessageDetailResponse>(`/api/admin/messages/${id}`, { cache: "no-store" });
    if (!result.ok) {
      setDetail(null);
      setDetailLoading(false);
      setNotice({ tone: "error", text: "Unable to load the selected message." });
      return;
    }

    let nextDetail = result.data;
    if (markRead && !result.data.message.isRead) {
      const readResult = await requestAdminData<{ message: MessageDetail }>(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set-read", isRead: true }),
      });
      if (readResult.ok) {
        nextDetail = { ...result.data, message: { ...result.data.message, ...readResult.data.message } };
        window.dispatchEvent(new Event("admin-badge-refresh"));
        void loadMessages();
      }
    }
    setDetail(nextDetail);
    setDetailLoading(false);
  }, [loadMessages]);

  useEffect(() => {
    if (!initialDetailLoaded.current && initialMessageId) {
      initialDetailLoaded.current = true;
      const timer = window.setTimeout(() => void loadDetail(initialMessageId), 0);
      return () => window.clearTimeout(timer);
    }
  }, [initialMessageId, loadDetail]);

  function selectMessage(id: string) {
    setSelectedId(id);
    setNotice(null);
    void loadDetail(id);
  }

  function updateFilter<K extends keyof InboxFilters>(key: K, value: InboxFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value, page: key === "page" ? Number(value) : 1 }));
  }

  async function mutateSelected(body: Record<string, unknown>, successText: string) {
    if (!selectedId) return;
    setBusy(true);
    const result = await requestAdminData<{ message: MessageDetail }>(`/api/admin/messages/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!result.ok) {
      setNotice({ tone: "error", text: result.message });
      return;
    }
    setNotice({ tone: "success", text: successText });
    setNote("");
    setResponseNote("");
    window.dispatchEvent(new Event("admin-badge-refresh"));
    await Promise.all([loadMessages(), loadDetail(selectedId, false)]);
  }

  async function bulkAction(body: Record<string, unknown>, successText: string) {
    setBusy(true);
    const result = await requestAdminData<{ updated: number }>("/api/admin/messages/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!result.ok) {
      setNotice({ tone: "error", text: result.message });
      return;
    }
    setNotice({ tone: "success", text: `${successText} (${result.data.updated})` });
    setSelectedIds(new Set());
    window.dispatchEvent(new Event("admin-badge-refresh"));
    await loadMessages();
    if (selectedId) await loadDetail(selectedId, false);
  }

  function toggleSelection(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearFilters() {
    setSearchInput("");
    setDebouncedSearch("");
    setFilters(INITIAL_FILTERS);
  }

  const summary = data?.summary ?? EMPTY_SUMMARY;
  const activeFilterCount = [filters.status, filters.purpose, filters.priority, filters.assignedUserId, filters.read, filters.dateFrom, filters.dateTo].filter(Boolean).length + (debouncedSearch ? 1 : 0);
  const exportHref = `/api/admin/messages/export?${queryString}`;

  return (
    <div className="mx-auto max-w-[1800px] space-y-5">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">Institutional communications</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-institutional">Messages</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Manage institutional correspondence, enquiries, and stakeholder communication.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={actionClass} onClick={() => setRefreshKey((key) => key + 1)} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden="true" /> Refresh
          </button>
          <a className={actionClass} href={exportHref}>
            <Download className="h-4 w-4" aria-hidden="true" /> Export
          </a>
          <button type="button" className={actionClass} onClick={() => void bulkAction({ action: "mark-all-read" }, "All active messages marked read")} disabled={busy || summary.unread === 0}>
            <CheckCheck className="h-4 w-4" aria-hidden="true" /> Mark all as read
          </button>
          <button type="button" className={cn(actionClass, "lg:hidden")} onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}>
            <Filter className="h-4 w-4" aria-hidden="true" /> Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </button>
        </div>
      </header>

      <section aria-label="Message summary" className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {([
          ["unread", "Unread", summary.unread, Mail],
          ["needs-response", "Needs Response", summary.needsResponse, Clock3],
          ["high-priority", "High Priority", summary.highPriority, Star],
          ["resolved", "Resolved", summary.resolved, Check],
          ["archived", "Archived", summary.archived, Archive],
        ] as const).map(([folder, label, count, Icon]) => (
          <button key={folder} type="button" onClick={() => updateFilter("folder", folder)} className={cn("rounded-xl border bg-white p-4 text-left shadow-sm transition hover:border-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest", filters.folder === folder ? "border-primary-400 ring-1 ring-primary-100" : "border-slate-200")}>
            <span className="flex items-center justify-between gap-3"><Icon className="h-4 w-4 text-forest" aria-hidden="true" /><span className="font-display text-2xl font-bold tabular-nums text-institutional">{count}</span></span>
            <span className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
          </button>
        ))}
      </section>

      <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Message folders">
        {FOLDERS.map(({ value, label }) => <button key={value} type="button" onClick={() => updateFilter("folder", value)} className={cn("shrink-0 rounded-full border px-3 py-2 text-xs font-semibold", filters.folder === value ? "border-primary-400 bg-primary-50 text-institutional" : "border-slate-200 bg-white text-slate-500")}>{label}</button>)}
      </nav>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-card" aria-label="Messages workspace">
        <div className="border-b border-slate-200 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search messages</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className={cn(fieldClass, "w-full pl-9")} placeholder="Search sender, organization, contact details, subject, message, or reference" />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              Sort
              <select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value as MessageSort)} className={fieldClass} aria-label="Sort messages">
                {MESSAGE_SORTS.map((sort) => <option key={sort} value={sort}>{labelize(sort)}</option>)}
              </select>
            </label>
          </div>

          <div className={cn("mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-6", !filtersOpen && "hidden lg:grid")}>
            <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value as MessageStatus | "")} className={fieldClass} aria-label="Filter by status">
              <option value="">All statuses</option>
              {MESSAGE_STATUSES.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
            </select>
            <select value={filters.purpose} onChange={(event) => updateFilter("purpose", event.target.value)} className={fieldClass} aria-label="Filter by purpose">
              <option value="">All purposes</option>
              {contactPurposeOptions.map((purpose) => <option key={purpose.value} value={purpose.value}>{purpose.label}</option>)}
            </select>
            <select value={filters.priority} onChange={(event) => updateFilter("priority", event.target.value as MessagePriority | "")} className={fieldClass} aria-label="Filter by priority">
              <option value="">All priorities</option>
              {MESSAGE_PRIORITIES.map((priority) => <option key={priority} value={priority}>{labelize(priority)}</option>)}
            </select>
            <select value={filters.assignedUserId} onChange={(event) => updateFilter("assignedUserId", event.target.value)} className={fieldClass} aria-label="Filter by assigned staff">
              <option value="">All assignees</option>
              <option value="__unassigned__">Unassigned</option>
              {assignees.map((assignee) => <option key={assignee.id} value={assignee.id}>{assignee.name}</option>)}
            </select>
            <select value={filters.read} onChange={(event) => updateFilter("read", event.target.value as InboxFilters["read"])} className={fieldClass} aria-label="Filter by read state">
              <option value="">Read and unread</option><option value="unread">Unread</option><option value="read">Read</option>
            </select>
            <button type="button" onClick={clearFilters} className={actionClass}><X className="h-4 w-4" aria-hidden="true" /> Clear filters</button>
            <label className="text-xs font-semibold text-slate-500">From<input type="date" value={filters.dateFrom} onChange={(event) => updateFilter("dateFrom", event.target.value)} className={cn(fieldClass, "mt-1 w-full")} /></label>
            <label className="text-xs font-semibold text-slate-500">To<input type="date" value={filters.dateTo} onChange={(event) => updateFilter("dateTo", event.target.value)} className={cn(fieldClass, "mt-1 w-full")} /></label>
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Active filters">
              <span className="text-xs font-semibold text-slate-500">Active:</span>
              {debouncedSearch && <FilterChip label={`Search: ${debouncedSearch}`} onRemove={() => setSearchInput("")} />}
              {filters.status && <FilterChip label={`Status: ${labelize(filters.status)}`} onRemove={() => updateFilter("status", "")} />}
              {filters.purpose && <FilterChip label={`Purpose: ${purposeLabel(filters.purpose)}`} onRemove={() => updateFilter("purpose", "")} />}
              {filters.priority && <FilterChip label={`Priority: ${labelize(filters.priority)}`} onRemove={() => updateFilter("priority", "")} />}
              {filters.assignedUserId && <FilterChip label={`Assigned: ${filters.assignedUserId === "__unassigned__" ? "Unassigned" : assignees.find((assignee) => assignee.id === filters.assignedUserId)?.name || "Staff"}`} onRemove={() => updateFilter("assignedUserId", "")} />}
              {filters.read && <FilterChip label={labelize(filters.read)} onRemove={() => updateFilter("read", "")} />}
              {filters.dateFrom && <FilterChip label={`From: ${filters.dateFrom}`} onRemove={() => updateFilter("dateFrom", "")} />}
              {filters.dateTo && <FilterChip label={`To: ${filters.dateTo}`} onRemove={() => updateFilter("dateTo", "")} />}
            </div>
          )}
        </div>

        {notice && <div role="status" className={cn("mx-4 mt-4 rounded-lg border px-4 py-3 text-sm", notice.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800")}>{notice.text}</div>}

        {selectedIds.size > 0 && (
          <div className="mx-4 mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 p-3" aria-label="Bulk message actions">
            <span className="mr-2 text-sm font-semibold text-institutional">{selectedIds.size} selected</span>
            <button type="button" className={actionClass} disabled={busy} onClick={() => void bulkAction({ action: "mark-read", ids: [...selectedIds] }, "Messages marked read")}>Mark read</button>
            <button type="button" className={actionClass} disabled={busy} onClick={() => void bulkAction({ action: "mark-unread", ids: [...selectedIds] }, "Messages marked unread")}>Mark unread</button>
            <select className={fieldClass} aria-label="Bulk change status" defaultValue="" onChange={(event) => { if (event.target.value) void bulkAction({ action: "set-status", ids: [...selectedIds], status: event.target.value }, "Status updated"); event.target.value = ""; }}>
              <option value="">Change status</option>{MESSAGE_STATUSES.filter((status) => status !== "archived").map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
            </select>
            <select className={fieldClass} aria-label="Bulk assign messages" defaultValue="" onChange={(event) => { if (event.target.value) void bulkAction({ action: "assign", ids: [...selectedIds], assignedUserId: event.target.value === "unassigned" ? null : event.target.value }, "Assignment updated"); event.target.value = ""; }}>
              <option value="">Assign</option><option value="unassigned">Unassigned</option>{assignees.map((assignee) => <option key={assignee.id} value={assignee.id}>{assignee.name}</option>)}
            </select>
            <button type="button" className={actionClass} disabled={busy} onClick={() => void bulkAction({ action: filters.folder === "archived" ? "restore" : "archive", ids: [...selectedIds] }, filters.folder === "archived" ? "Messages restored" : "Messages archived")}>
              {filters.folder === "archived" ? <ArchiveRestore className="h-4 w-4" aria-hidden="true" /> : <Archive className="h-4 w-4" aria-hidden="true" />}
              {filters.folder === "archived" ? "Restore" : "Archive"}
            </button>
          </div>
        )}

        <div className="grid min-h-[38rem] lg:grid-cols-[12rem_minmax(20rem,0.9fr)_minmax(23rem,1.15fr)]">
          <FolderRail filters={filters} summary={summary} purposeCounts={data?.purposeCounts ?? {}} onFolder={(folder) => updateFilter("folder", folder)} onPurpose={(purpose) => updateFilter("purpose", purpose)} />

          <div className={cn("min-w-0 border-slate-200 lg:border-l", selectedId && "hidden lg:block")}>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary-700 focus:ring-forest" checked={Boolean(data?.messages.length) && data!.messages.every((message) => selectedIds.has(message.id))} onChange={(event) => setSelectedIds(event.target.checked ? new Set(data?.messages.map((message) => message.id)) : new Set())} aria-label="Select all messages on this page" />
                Select page
              </label>
              <span className="text-xs tabular-nums text-slate-500">{data?.total ?? 0} message{data?.total === 1 ? "" : "s"}</span>
            </div>

            {loading ? <MessageListSkeleton /> : loadError ? (
              <MessageLoadError onRetry={() => setRefreshKey((key) => key + 1)} />
            ) : !data?.messages.length ? (
              <div className="flex min-h-96 items-center justify-center p-8 text-center">
                <div><MailOpen className="mx-auto h-9 w-9 text-slate-300" aria-hidden="true" /><h2 className="mt-4 font-display text-lg font-bold text-institutional">No messages yet.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">New enquiries submitted through the RECCU-CAM contact form will appear here.</p></div>
              </div>
            ) : (
              <ul className="divide-y divide-slate-200" aria-label="Message inbox">
                {data.messages.map((message) => (
                  <MessageRow key={message.id} message={message} currentTime={currentTime} selected={selectedId === message.id} checked={selectedIds.has(message.id)} onSelect={() => selectMessage(message.id)} onCheck={() => toggleSelection(message.id)} />
                ))}
              </ul>
            )}

            {data && data.totalPages > 1 && (
              <nav className="flex items-center justify-between border-t border-slate-200 px-4 py-3" aria-label="Message pages">
                <button type="button" className={actionClass} disabled={filters.page <= 1} onClick={() => updateFilter("page", filters.page - 1)}><ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous</button>
                <span className="text-xs text-slate-500">Page {data.page} of {data.totalPages}</span>
                <button type="button" className={actionClass} disabled={filters.page >= data.totalPages} onClick={() => updateFilter("page", filters.page + 1)}>Next <ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
              </nav>
            )}
          </div>

          <div className={cn("min-w-0 border-l border-slate-200 bg-slate-50/50", !selectedId && "hidden lg:block")}>
            {detailLoading ? <MessageDetailSkeleton /> : detail ? (
              <MessageDetailPanel
                detail={detail}
                assignees={assignees}
                currentUserId={currentUserId}
                busy={busy}
                currentTime={currentTime}
                note={note}
                responseMethod={responseMethod}
                responseNote={responseNote}
                onBack={() => { setSelectedId(null); setDetail(null); }}
                onNote={setNote}
                onResponseMethod={setResponseMethod}
                onResponseNote={setResponseNote}
                onMutate={mutateSelected}
              />
            ) : (
              <div className="hidden min-h-[38rem] items-center justify-center p-8 text-center lg:flex"><div><MessageSquareText className="mx-auto h-9 w-9 text-slate-300" aria-hidden="true" /><p className="mt-4 font-semibold text-slate-700">Select a message</p><p className="mt-1 text-sm text-slate-500">Full correspondence and its activity trail will appear here.</p></div></div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function FolderRail({ filters, summary, purposeCounts, onFolder, onPurpose }: { filters: InboxFilters; summary: typeof EMPTY_SUMMARY; purposeCounts: Record<string, number>; onFolder: (folder: MessageFolder) => void; onPurpose: (purpose: string) => void }) {
  return (
    <aside className="hidden p-3 lg:block" aria-label="Message folders and purposes">
      <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Folders</p>
      <nav className="space-y-1">
        {FOLDERS.map(({ value, label, icon: Icon, count }) => <button key={value} type="button" onClick={() => onFolder(value)} className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest", filters.folder === value ? "bg-primary-50 text-institutional" : "text-slate-600 hover:bg-slate-50")}><Icon className="h-4 w-4" aria-hidden="true" /><span className="min-w-0 flex-1">{label}</span>{count && <span className="text-xs tabular-nums text-slate-400">{summary[count]}</span>}</button>)}
      </nav>
      <p className="mt-6 px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">By purpose</p>
      <div className="space-y-1">
        {contactPurposeOptions.map((purpose) => <button key={purpose.value} type="button" onClick={() => onPurpose(purpose.value)} className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest", filters.purpose === purpose.value ? "bg-amber-50 font-semibold text-amber-900" : "text-slate-500 hover:bg-slate-50")}><span className="min-w-0 flex-1 leading-4">{purpose.label}</span><span className="tabular-nums text-slate-400">{purposeCounts[purpose.value] ?? 0}</span></button>)}
      </div>
    </aside>
  );
}

function MessageRow({ message, currentTime, selected, checked, onSelect, onCheck }: { message: MessageListRow; currentTime: number; selected: boolean; checked: boolean; onSelect: () => void; onCheck: () => void }) {
  return (
    <li className={cn("relative flex gap-3 p-4 transition", selected ? "bg-primary-50" : "hover:bg-slate-50", !message.isRead && "border-l-[3px] border-l-primary-600")}>
      <input type="checkbox" checked={checked} onChange={onCheck} onClick={(event) => event.stopPropagation()} className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-primary-700 focus:ring-forest" aria-label={`Select message from ${message.name}`} />
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest" aria-label={`Open message ${message.subject} from ${message.name}${message.isRead ? "" : ", unread"}`}>
        <span className="flex items-start justify-between gap-3"><span className={cn("truncate text-sm text-slate-900", !message.isRead && "font-bold")}>{message.name}</span><time dateTime={message.createdAt} className="shrink-0 text-[11px] text-slate-400">{formatListDate(message.createdAt)}</time></span>
        <span className="mt-1 flex items-center gap-2"><span className="truncate text-xs text-slate-500">{message.organization || "No organization"}</span><span className="text-slate-300">·</span><span className="truncate text-xs text-slate-500">{purposeLabel(message.purpose)}</span>{!message.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-600" aria-label="Unread" />}</span>
        <span className={cn("mt-2 block truncate text-sm text-slate-800", !message.isRead && "font-semibold")}>{message.subject}</span>
        <span className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{message.preview}</span>
        <span className="mt-3 flex flex-wrap items-center gap-2"><StatusChip value={message.status} /><PriorityChip value={message.priority} /><AttentionChip message={message} currentTime={currentTime} /><span className="truncate text-[11px] text-slate-400">{message.assignedTo || "Unassigned"}</span></span>
      </button>
    </li>
  );
}

function MessageDetailPanel({ detail, assignees, currentUserId, busy, currentTime, note, responseMethod, responseNote, onBack, onNote, onResponseMethod, onResponseNote, onMutate }: { detail: MessageDetailResponse; assignees: Assignee[]; currentUserId: string; busy: boolean; currentTime: number; note: string; responseMethod: string; responseNote: string; onBack: () => void; onNote: (value: string) => void; onResponseMethod: (value: string) => void; onResponseNote: (value: string) => void; onMutate: (body: Record<string, unknown>, successText: string) => Promise<void> }) {
  const { message, activity } = detail;
  const staffNames = new Map(assignees.map((assignee) => [assignee.id, assignee.name]));
  const archived = Boolean(message.archivedAt);

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    window.dispatchEvent(new CustomEvent("message-copy", { detail: label }));
  }

  return (
    <article className="min-h-[38rem]" aria-labelledby="message-detail-subject">
      <div className="border-b border-slate-200 bg-white p-4">
        <button type="button" onClick={onBack} className={cn(actionClass, "mb-3 lg:hidden")}><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to inbox</button>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={actionClass} disabled={busy} onClick={() => void onMutate({ action: "set-read", isRead: !message.isRead }, message.isRead ? "Message marked unread" : "Message marked read")}>{message.isRead ? <Mail className="h-4 w-4" aria-hidden="true" /> : <MailOpen className="h-4 w-4" aria-hidden="true" />}{message.isRead ? "Mark unread" : "Mark read"}</button>
          <select value={message.assignedUserId ?? ""} onChange={(event) => void onMutate({ action: "assign", assignedUserId: event.target.value || null }, "Assignment updated")} className={fieldClass} aria-label="Assign message" disabled={busy}><option value="">Unassigned</option>{assignees.map((assignee) => <option key={assignee.id} value={assignee.id}>{assignee.name}</option>)}</select>
          {currentUserId && message.assignedUserId !== currentUserId && <button type="button" className={actionClass} disabled={busy} onClick={() => void onMutate({ action: "assign", assignedUserId: currentUserId }, "Assigned to you")}>Assign to me</button>}
          <select value={message.status} onChange={(event) => void onMutate({ action: "set-status", status: event.target.value }, "Status updated")} className={fieldClass} aria-label="Change message status" disabled={busy}>{MESSAGE_STATUSES.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}</select>
          <select value={message.priority} onChange={(event) => void onMutate({ action: "set-priority", priority: event.target.value }, "Priority updated")} className={fieldClass} aria-label="Change message priority" disabled={busy}>{MESSAGE_PRIORITIES.map((priority) => <option key={priority} value={priority}>{labelize(priority)}</option>)}</select>
          <button type="button" className={actionClass} disabled={busy} onClick={() => void onMutate({ action: "archive", archived: !archived }, archived ? "Message restored" : "Message archived")}>{archived ? <ArchiveRestore className="h-4 w-4" aria-hidden="true" /> : <Archive className="h-4 w-4" aria-hidden="true" />}{archived ? "Restore" : "Archive"}</button>
          <details className="relative"><summary className={cn(actionClass, "cursor-pointer list-none")} aria-label="More message actions"><MoreHorizontal className="h-4 w-4" aria-hidden="true" /> More</summary><div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-raised">{message.email && <button type="button" className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50" onClick={() => void copy(message.email!, "Email address")}>Copy email address</button>}<button type="button" className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50" onClick={() => void copy(message.referenceNumber, "Reference number")}>Copy reference number</button></div></details>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2"><StatusChip value={message.status} /><PriorityChip value={message.priority} /><AttentionChip message={message} currentTime={currentTime} />{!message.isRead && <span className="text-xs font-semibold text-primary-700">Unread</span>}</div>
          <p className="mt-4 font-mono text-xs font-semibold tracking-wide text-slate-500">{message.referenceNumber}</p>
          <h2 id="message-detail-subject" className="mt-2 font-display text-2xl font-bold leading-tight text-institutional">{message.subject}</h2>
          <p className="mt-2 text-xs text-slate-500">Submitted {formatFullDate(message.createdAt)}</p>
        </div>

        <dl className="grid gap-x-5 gap-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <DetailField label="Full name" value={message.name} />
          <DetailField label="Organization" value={message.organization} />
          <DetailField label="Role" value={message.role} />
          <DetailField label="Purpose" value={purposeLabel(message.purpose)} />
          <DetailField label="Phone" value={message.phone} />
          <DetailField label="Email" value={message.email} />
          <DetailField label="Assigned staff" value={message.assignedTo || "Unassigned"} />
          <DetailField label="Department" value={message.department} />
        </dl>

        <section><h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Message</h3><div className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700">{message.message}</div></section>

        {message.email && <button type="button" className={actionClass} onClick={() => void copy(message.email!, "Email address")}><Copy className="h-4 w-4" aria-hidden="true" /> Copy Email Address</button>}

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-institutional">Response tracking</h3>
          {message.respondedAt && <p className="mt-2 text-xs text-emerald-700">Recorded {formatFullDate(message.respondedAt)} via {labelize(message.responseMethod || "other")} by {message.respondedBy ? staffNames.get(message.respondedBy) || `Staff ${message.respondedBy.slice(-6)}` : "authorized staff"}.</p>}
          {message.responseNote && <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{message.responseNote}</p>}
          <div className="mt-4 grid gap-3 sm:grid-cols-[10rem_1fr]">
            <select value={responseMethod} onChange={(event) => onResponseMethod(event.target.value)} className={fieldClass} aria-label="Response method">{MESSAGE_RESPONSE_METHODS.map((method) => <option key={method} value={method}>{labelize(method)}</option>)}</select>
            <input value={responseNote} onChange={(event) => onResponseNote(event.target.value)} className={fieldClass} maxLength={2000} placeholder="Optional note, e.g. Response sent externally" aria-label="Response note" />
          </div>
          <button type="button" className={cn(actionClass, "mt-3")} disabled={busy} onClick={() => void onMutate({ action: "mark-responded", responseMethod, responseNote }, "Response recorded")}><Send className="h-4 w-4" aria-hidden="true" /> Mark as Responded</button>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-institutional">Internal notes</h3>
          <p className="mt-1 text-xs text-slate-500">Visible only to authorized staff. Notes are never sent to the sender.</p>
          <textarea value={note} onChange={(event) => onNote(event.target.value)} rows={3} maxLength={4000} className={cn(fieldClass, "mt-4 h-auto w-full py-3")} placeholder="Add review context or follow-up instructions" />
          <button type="button" className={cn(actionClass, "mt-3")} disabled={busy || note.trim().length < 2} onClick={() => void onMutate({ action: "add-note", body: note }, "Internal note added")}><FileText className="h-4 w-4" aria-hidden="true" /> Add internal note</button>
          <div className="mt-5 space-y-3">{message.notes.length === 0 ? <p className="text-sm text-slate-400">No internal notes.</p> : message.notes.map((item) => <div key={item.id} className="rounded-lg bg-slate-50 p-3"><p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.body}</p><p className="mt-2 text-[11px] text-slate-400">{staffNames.get(item.authorUserId) || `Staff ${item.authorUserId.slice(-6)}`} · {formatFullDate(item.createdAt)}</p></div>)}</div>
        </section>

        <section>
          <h3 className="font-semibold text-institutional">Activity timeline</h3>
          <ol className="mt-4 border-l border-slate-200 pl-5">
            {activity.map((item) => <li key={item.id} className="relative pb-5 last:pb-0"><span className="absolute -left-[1.48rem] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary-600" /><p className="text-sm font-semibold text-slate-700">{activityLabel(item)}</p><p className="mt-1 text-xs text-slate-400">{staffNames.get(item.actorId) || `Staff ${item.actorId.slice(-6)}`} · {formatFullDate(item.createdAt)}</p></li>)}
            <li className="relative"><span className="absolute -left-[1.48rem] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-400" /><p className="text-sm font-semibold text-slate-700">Message received</p><p className="mt-1 text-xs text-slate-400">Public contact channel · {formatFullDate(message.createdAt)}</p></li>
          </ol>
        </section>

        <div className="flex items-start gap-2 rounded-xl border border-primary-100 bg-primary-50 p-4 text-xs leading-5 text-primary-900"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />This record contains personal information and is available only within the authorized RECCU-CAM workspace.</div>
      </div>
    </article>
  );
}

function DetailField({ label, value }: { label: string; value: string | null }) { return <div><dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-slate-700">{value || "Not provided"}</dd></div>; }
function StatusChip({ value }: { value: string }) { const tone = value === "resolved" || value === "responded" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : value === "new" || value === "in-review" || value === "awaiting-response" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-600"; return <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", tone)}>{labelize(value)}</span>; }
function PriorityChip({ value }: { value: string }) { const tone = value === "urgent" ? "border-red-200 bg-red-50 text-red-700" : value === "high" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-500"; return <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", tone)}>{labelize(value)}</span>; }
function AttentionChip({ message, currentTime }: { message: Pick<MessageListRow, "responseDueAt" | "status">; currentTime: number }) { if (!message.responseDueAt || ["responded", "resolved", "archived"].includes(message.status)) return null; const due = new Date(message.responseDueAt); const overdue = due.getTime() < currentTime; return <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", overdue ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-800")}>{overdue ? "Overdue" : `Target ${formatListDate(message.responseDueAt)}`}</span>; }
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) { return <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800">{label}<X className="h-3 w-3" aria-hidden="true" /></button>; }
function MessageListSkeleton() { return <div className="divide-y divide-slate-200" role="status" aria-label="Loading messages">{Array.from({ length: 6 }, (_, index) => <div key={index} className="animate-pulse p-4"><div className="flex justify-between"><div className="h-4 w-2/5 rounded bg-slate-200" /><div className="h-3 w-16 rounded bg-slate-100" /></div><div className="mt-3 h-4 w-4/5 rounded bg-slate-100" /><div className="mt-2 h-3 w-full rounded bg-slate-100" /></div>)}</div>; }
function MessageDetailSkeleton() { return <div className="animate-pulse space-y-5 p-6" role="status" aria-label="Loading message details"><div className="h-10 w-full rounded bg-slate-200" /><div className="h-6 w-3/4 rounded bg-slate-200" /><div className="h-40 rounded bg-white" /><div className="h-64 rounded bg-white" /></div>; }
function MessageLoadError({ onRetry }: { onRetry: () => void }) { return <div className="flex min-h-96 items-center justify-center p-8 text-center" role="alert"><div><CircleAlert className="mx-auto h-9 w-9 text-amber-600" aria-hidden="true" /><h2 className="mt-4 font-display text-lg font-bold text-institutional">Unable to load messages.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">We couldn&apos;t retrieve the inbox right now. Your session remains secure.</p><div className="mt-5 flex justify-center gap-2"><button type="button" onClick={onRetry} className={actionClass}><RefreshCw className="h-4 w-4" aria-hidden="true" /> Retry</button><Link href="/admin" className={actionClass}>Back to Dashboard</Link></div></div></div>; }

function labelize(value: string) { return value.replaceAll("-", " ").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function purposeLabel(value: string) { return contactPurposeOptions.find((purpose) => purpose.value === value)?.label ?? labelize(value); }
function dateKey(date: Date) { return date.toLocaleDateString("en-CA", { timeZone: "Africa/Douala" }); }
function formatListDate(value: string) { const date = new Date(value); const now = new Date(); const yesterday = new Date(now.getTime() - 86_400_000); const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Douala" }); if (dateKey(date) === dateKey(now)) return `Today, ${time}`; if (dateKey(date) === dateKey(yesterday)) return `Yesterday, ${time}`; return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Africa/Douala" }); }
function formatFullDate(value: string) { return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Douala", timeZoneName: "short" }).format(new Date(value)); }
function activityLabel(activity: MessageActivity) { const metadata = activity.metadata ?? {}; if (activity.action === "status_changed" && typeof metadata.to === "string") return `Status changed to ${labelize(metadata.to)}`; if (activity.action === "priority_changed" && typeof metadata.to === "string") return `Priority changed to ${labelize(metadata.to)}`; if (activity.action === "assigned" && typeof metadata.assignedTo === "string") return `Assigned to ${metadata.assignedTo}`; return labelize(activity.action); }
