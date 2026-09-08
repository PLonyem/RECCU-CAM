"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Inbox,
  Mail,
  MailOpen,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";
import { contactPurposeOptions } from "@/data/contact";
import {
  PRIMARY_MESSAGE_FOLDERS,
  type MessageFolder,
} from "@/lib/message-inbox";
import { requestAdminData } from "@/lib/admin-data-client";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

type PrimaryFolder = (typeof PRIMARY_MESSAGE_FOLDERS)[number];

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
  isStarred: boolean;
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
  summary: {
    inbox: number;
    unread: number;
    starred: number;
    needsResponse: number;
    highPriority: number;
    resolved: number;
    archived: number;
  };
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
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
}

interface MessageDetailResponse {
  message: MessageDetail;
}

const EMPTY_SUMMARY: MessageListResponse["summary"] = {
  inbox: 0,
  unread: 0,
  starred: 0,
  needsResponse: 0,
  highPriority: 0,
  resolved: 0,
  archived: 0,
};

const FOLDERS: Array<{
  value: PrimaryFolder;
  label: string;
  icon: typeof Inbox;
  count: "inbox" | "unread" | "starred" | "archived";
}> = [
  { value: "inbox", label: "Inbox", icon: Inbox, count: "inbox" },
  { value: "unread", label: "Unread", icon: Mail, count: "unread" },
  { value: "starred", label: "Starred", icon: Star, count: "starred" },
  { value: "archived", label: "Archived", icon: Archive, count: "archived" },
];

const actionClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest disabled:cursor-not-allowed disabled:opacity-50";

export function MessagesInbox({
  initialFolder = "inbox",
  initialMessageId,
}: {
  initialFolder?: MessageFolder;
  initialMessageId?: string;
}) {
  const { tText } = useLanguage();
  const visibleInitialFolder = PRIMARY_MESSAGE_FOLDERS.includes(initialFolder as PrimaryFolder)
    ? initialFolder as PrimaryFolder
    : "inbox";
  const [folder, setFolder] = useState<PrimaryFolder>(visibleInitialFolder);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState<MessageListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(initialMessageId ?? null);
  const [detail, setDetail] = useState<MessageDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const initialDetailLoaded = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      folder,
      sort: "newest",
      page: String(page),
      limit: "20",
    });
    if (debouncedSearch) params.set("q", debouncedSearch);
    return params.toString();
  }, [debouncedSearch, folder, page]);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    const result = await requestAdminData<MessageListResponse>(`/api/admin/messages?${queryString}`, {
      cache: "no-store",
    });
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

  const loadDetail = useCallback(async (id: string, markRead = true) => {
    setDetailLoading(true);
    setDetailError(false);
    const result = await requestAdminData<MessageDetailResponse>(`/api/admin/messages/${id}`, {
      cache: "no-store",
    });
    if (!result.ok) {
      setDetail(null);
      setDetailError(true);
      setDetailLoading(false);
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
        nextDetail = {
          ...result.data,
          message: { ...result.data.message, ...readResult.data.message },
        };
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
    setDetail(null);
    setNotice(null);
    void loadDetail(id);
  }

  function closeDetail() {
    setSelectedId(null);
    setDetail(null);
    setDetailError(false);
  }

  function changeFolder(nextFolder: PrimaryFolder) {
    setFolder(nextFolder);
    setPage(1);
    closeDetail();
    setSelectedIds(new Set());
  }

  function refreshInbox() {
    setRefreshKey((key) => key + 1);
  }

  async function mutateMessage(
    id: string,
    body: Record<string, unknown>,
    successText: string,
    closeAfter = false,
  ) {
    setBusy(true);
    const result = await requestAdminData<{ message: MessageDetail }>(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!result.ok) {
      setNotice({ tone: "error", text: result.message });
      return false;
    }
    setNotice({ tone: "success", text: successText });
    window.dispatchEvent(new Event("admin-badge-refresh"));
    await loadMessages();
    if (closeAfter) closeDetail();
    else if (selectedId === id) await loadDetail(id, false);
    return true;
  }

  async function toggleRowStar(message: MessageListRow) {
    const isStarred = !message.isStarred;
    setData((current) => current ? {
      ...current,
      messages: current.messages.map((row) => row.id === message.id ? { ...row, isStarred } : row),
    } : current);
    const result = await requestAdminData<{ message: MessageDetail }>(`/api/admin/messages/${message.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set-star", isStarred }),
    });
    if (!result.ok) {
      setData((current) => current ? {
        ...current,
        messages: current.messages.map((row) => row.id === message.id ? { ...row, isStarred: message.isStarred } : row),
      } : current);
      setNotice({ tone: "error", text: result.message });
      return;
    }
    setNotice({ tone: "success", text: tText(isStarred ? "Message starred" : "Message unstarred") });
    await loadMessages();
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
  }

  function toggleSelection(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const summary = data?.summary ?? EMPTY_SUMMARY;
  const allPageSelected = Boolean(data?.messages.length)
    && data!.messages.every((message) => selectedIds.has(message.id));

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-institutional">{tText("Messages")}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{tText("Review and respond to institutional enquiries.")}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
          <label className="relative min-w-0 sm:w-80 lg:w-96">
            <span className="sr-only">{tText("Search messages")}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
              className="min-h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder={tText("Search messages...")}
            />
          </label>
          <button type="button" className={actionClass} onClick={refreshInbox} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden="true" />
            {tText("Refresh")}
          </button>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card" aria-label={tText("Messages inbox")}>
        <div className="border-b border-slate-200 p-3 lg:hidden">
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <span>{tText("Folder")}</span>
            <select
              value={folder}
              onChange={(event) => changeFolder(event.target.value as PrimaryFolder)}
              className="min-h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              aria-label={tText("Choose inbox folder")}
            >
              {FOLDERS.map((item) => (
                <option key={item.value} value={item.value}>{tText(item.label)} ({summary[item.count]})</option>
              ))}
            </select>
          </label>
        </div>

        {notice && (
          <div
            role="status"
            className={cn(
              "mx-4 mt-4 rounded-lg border px-4 py-3 text-sm",
              notice.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800",
            )}
          >
            {notice.text}
          </div>
        )}

        <div className="grid min-h-[36rem] lg:grid-cols-[13rem_minmax(0,1fr)]">
          <FolderNavigation folder={folder} summary={summary} onChange={changeFolder} />

          <div className="min-w-0 lg:border-l lg:border-slate-200">
            {selectedId ? (
              detailLoading || (!detail && !detailError) ? <MessageDetailSkeleton /> : detail ? (
                <MessageDetailView
                  message={detail.message}
                  busy={busy}
                  onBack={closeDetail}
                  onMutate={(body, text, closeAfter) => mutateMessage(selectedId, body, text, closeAfter)}
                />
              ) : (
                <MessageDetailError
                  onBack={closeDetail}
                  onRetry={() => void loadDetail(selectedId)}
                />
              )
            ) : (
              <>
                <div className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-200 px-4 py-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-primary-700 focus:ring-forest"
                      checked={allPageSelected}
                      onChange={(event) => setSelectedIds(event.target.checked
                        ? new Set(data?.messages.map((message) => message.id))
                        : new Set())}
                      aria-label={tText("Select all messages on this page")}
                    />
                    <span className="hidden sm:inline">{tText("Select all")}</span>
                  </label>

                  {selectedIds.size > 0 ? (
                    <div className="flex flex-wrap items-center justify-end gap-1.5" aria-label="Bulk message actions">
                      <span className="mr-1 text-xs font-semibold text-institutional">{selectedIds.size} {tText("selected")}</span>
                      <ToolbarButton disabled={busy} label={tText("Mark read")} icon={MailOpen} onClick={() => void bulkAction({ action: "mark-read", ids: [...selectedIds] }, tText("Messages marked read"))} />
                      <ToolbarButton disabled={busy} label={tText("Mark unread")} icon={Mail} onClick={() => void bulkAction({ action: "mark-unread", ids: [...selectedIds] }, tText("Messages marked unread"))} />
                      <ToolbarButton disabled={busy} label="Star" icon={Star} onClick={() => void bulkAction({ action: "set-star", ids: [...selectedIds], isStarred: true }, "Messages starred")} />
                      <ToolbarButton
                        disabled={busy}
                        label={folder === "archived" ? "Restore" : "Archive"}
                        icon={folder === "archived" ? ArchiveRestore : Archive}
                        onClick={() => void bulkAction(
                          { action: folder === "archived" ? "restore" : "archive", ids: [...selectedIds] },
                          tText(folder === "archived" ? "Messages restored" : "Messages archived"),
                        )}
                      />
                    </div>
                  ) : (
                    <span className="text-xs tabular-nums text-slate-500">{data?.total ?? 0} {tText("messages")}</span>
                  )}
                </div>

                {loading ? <MessageListSkeleton /> : loadError ? (
                  <MessageLoadError onRetry={refreshInbox} onRefresh={refreshInbox} />
                ) : !data?.messages.length ? (
                  <MessageEmptyState folder={folder} searching={Boolean(debouncedSearch)} />
                ) : (
                  <ul className="divide-y divide-slate-200" aria-label="Message list">
                    {data.messages.map((message) => (
                      <MessageRow
                        key={message.id}
                        message={message}
                        checked={selectedIds.has(message.id)}
                        onSelect={() => selectMessage(message.id)}
                        onCheck={() => toggleSelection(message.id)}
                        onStar={() => void toggleRowStar(message)}
                      />
                    ))}
                  </ul>
                )}

                {data && data.total > 0 && (
                  <Pagination
                    page={data.page}
                    limit={data.limit}
                    total={data.total}
                    totalPages={data.totalPages}
                    onPage={setPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function FolderNavigation({
  folder,
  summary,
  onChange,
}: {
  folder: PrimaryFolder;
  summary: MessageListResponse["summary"];
  onChange: (folder: PrimaryFolder) => void;
}) {
  const { tText } = useLanguage();
  return (
    <aside className="hidden bg-slate-50/70 p-3 lg:block" aria-label="Inbox folders">
      <nav className="space-y-1">
        {FOLDERS.map(({ value, label, icon: Icon, count }) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={cn(
              "flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest",
              folder === value
                ? "bg-primary-100 text-institutional"
                : "text-slate-600 hover:bg-white hover:text-slate-900",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="min-w-0 flex-1">{tText(label)}</span>
            <span className="text-xs tabular-nums text-slate-500">{summary[count]}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function MessageRow({
  message,
  checked,
  onSelect,
  onCheck,
  onStar,
}: {
  message: MessageListRow;
  checked: boolean;
  onSelect: () => void;
  onCheck: () => void;
  onStar: () => void;
}) {
  const { language, tText } = useLanguage();
  return (
    <li className={cn(
      "grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-2 px-3 py-1 transition hover:bg-slate-50 sm:gap-3 sm:px-4",
      !message.isRead && "bg-primary-50/35",
    )}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onCheck}
        className="h-4 w-4 rounded border-slate-300 text-primary-700 focus:ring-forest"
        aria-label={`${tText("Select message from")} ${message.name}`}
      />
      <button
        type="button"
        onClick={onStar}
        className="rounded-md p-2 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
        aria-label={`${tText(message.isStarred ? "Unstar" : "Star")} ${tText("message from")} ${message.name}`}
        aria-pressed={message.isStarred}
      >
        <Star className={cn("h-4 w-4", message.isStarred && "fill-amber-400 text-amber-500")} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="grid min-h-16 min-w-0 items-center gap-x-4 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forest md:grid-cols-[minmax(8rem,0.28fr)_minmax(0,1fr)_auto]"
        aria-label={`${tText("Open")} ${message.isRead ? "" : `${tText("unread")} `}${tText("message")} ${message.subject} ${tText("from")} ${message.name}`}
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            {!message.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-600" aria-hidden="true" />}
            <span className={cn("truncate text-sm text-slate-900", !message.isRead ? "font-bold" : "font-medium")}>{message.name}</span>
          </span>
          {message.organization && <span className="mt-0.5 block truncate pl-4 text-xs text-slate-500">{message.organization}</span>}
        </span>
        <span className="mt-1 min-w-0 md:mt-0">
          <span className={cn("text-sm text-slate-800", !message.isRead && "font-bold")}>{message.subject}</span>
          <span className="text-sm text-slate-400"> — </span>
          <span className="text-sm text-slate-500">{message.preview}</span>
        </span>
        <time dateTime={message.createdAt} className="mt-1 whitespace-nowrap text-xs text-slate-500 md:mt-0">{formatListDate(message.createdAt, language)}</time>
      </button>
    </li>
  );
}

function MessageDetailView({
  message,
  busy,
  onBack,
  onMutate,
}: {
  message: MessageDetail;
  busy: boolean;
  onBack: () => void;
  onMutate: (body: Record<string, unknown>, successText: string, closeAfter?: boolean) => Promise<boolean>;
}) {
  const { language, tText } = useLanguage();
  const archived = Boolean(message.archivedAt);
  return (
    <article aria-labelledby="message-subject" className="min-h-[36rem]">
      <div className="border-b border-slate-200 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {tText("Back to Inbox")}
        </button>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className={actionClass} disabled={busy} onClick={() => void onMutate(
            { action: "set-read", isRead: !message.isRead },
            tText(message.isRead ? "Message marked unread" : "Message marked read"),
          )}>
            {message.isRead ? <Mail className="h-4 w-4" aria-hidden="true" /> : <MailOpen className="h-4 w-4" aria-hidden="true" />}
            {tText(message.isRead ? "Mark Unread" : "Mark Read")}
          </button>
          <button type="button" className={actionClass} disabled={busy} onClick={() => void onMutate(
            { action: "set-star", isStarred: !message.isStarred },
            tText(message.isStarred ? "Message unstarred" : "Message starred"),
          )}>
            <Star className={cn("h-4 w-4", message.isStarred && "fill-amber-400 text-amber-500")} aria-hidden="true" />
            {tText(message.isStarred ? "Unstar" : "Star")}
          </button>
          <button type="button" className={actionClass} disabled={busy} onClick={() => void onMutate(
            { action: "archive", archived: !archived },
            tText(archived ? "Message restored" : "Message archived"),
            true,
          )}>
            {archived ? <ArchiveRestore className="h-4 w-4" aria-hidden="true" /> : <Archive className="h-4 w-4" aria-hidden="true" />}
            {tText(archived ? "Restore" : "Archive")}
          </button>
          <button
            type="button"
            className={actionClass}
            disabled={busy || message.status === "resolved"}
            onClick={() => void onMutate({ action: "set-status", status: "resolved" }, tText("Message marked resolved"))}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {tText(message.status === "resolved" ? "Resolved" : "Mark Resolved")}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-7 p-5 sm:p-8">
        <div>
          <p className="font-mono text-xs font-semibold tracking-wide text-slate-400">{message.referenceNumber}</p>
          <h2 id="message-subject" className="mt-2 font-display text-2xl font-bold leading-tight text-institutional sm:text-3xl">{message.subject}</h2>
          <p className="mt-2 text-sm text-slate-500">{formatFullDate(message.createdAt, language)}</p>
        </div>

        <dl className="grid gap-x-8 gap-y-5 border-y border-slate-200 py-6 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label={tText("Full Name")} value={message.name} />
          <DetailField label={tText("Organization")} value={message.organization} />
          <DetailField label={tText("Role")} value={message.role} />
          <DetailField label={tText("Email")} value={message.email} />
          <DetailField label={tText("Phone")} value={message.phone} />
          <DetailField label={tText("Submission Date")} value={formatFullDate(message.createdAt, language)} />
        </dl>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{tText("Purpose")}</h3>
          <p className="mt-2 text-sm font-semibold text-slate-800">{tText(purposeLabel(message.purpose))}</p>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{tText("Message")}</h3>
          <div className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50/50 p-5 text-sm leading-7 text-slate-700 sm:p-6">{message.message}</div>
        </section>
      </div>
    </article>
  );
}

function ToolbarButton({
  label,
  icon: Icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: typeof Mail;
  disabled: boolean;
  onClick: () => void;
}) {
  const { tText } = useLanguage();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest disabled:opacity-50"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">{tText(label)}</span>
      <span className="sr-only sm:hidden">{tText(label)}</span>
    </button>
  );
}

function Pagination({
  page,
  limit,
  total,
  totalPages,
  onPage,
}: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  const { language, tText } = useLanguage();
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return (
    <nav className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3" aria-label={tText("Message pages")}>
      <span className="mr-2 text-xs tabular-nums text-slate-500">{new Intl.NumberFormat(language === "fr" ? "fr-CM" : "en-CM").format(start)}–{new Intl.NumberFormat(language === "fr" ? "fr-CM" : "en-CM").format(end)} {tText("of")} {new Intl.NumberFormat(language === "fr" ? "fr-CM" : "en-CM").format(total)}</span>
      <button type="button" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest disabled:opacity-35" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label={tText("Previous page")}>
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest disabled:opacity-35" disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label={tText("Next page")}>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

function MessageEmptyState({ folder, searching }: { folder: PrimaryFolder; searching: boolean }) {
  const { tText } = useLanguage();
  const content = searching
    ? { title: "No matching messages.", description: "Try another name, organization, email, subject, or keyword." }
    : {
        inbox: { title: "No messages yet.", description: "New enquiries submitted through the RECCU-CAM website will appear here." },
        unread: { title: "No unread messages.", description: "You are up to date with incoming enquiries." },
        starred: { title: "No starred messages.", description: "Star important messages to keep them easy to find." },
        archived: { title: "No archived messages.", description: "Messages you archive will remain available here." },
      }[folder];
  return (
    <div className="flex min-h-96 items-center justify-center px-6 py-10 text-center">
      <div>
        <MailOpen className="mx-auto h-9 w-9 text-slate-300" aria-hidden="true" />
        <h2 className="mt-4 font-display text-lg font-bold text-institutional">{tText(content.title)}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{tText(content.description)}</p>
      </div>
    </div>
  );
}

function MessageLoadError({ onRetry, onRefresh }: { onRetry: () => void; onRefresh: () => void }) {
  const { tText } = useLanguage();
  return (
    <div className="flex min-h-96 items-center justify-center px-6 py-10 text-center" role="alert">
      <div>
        <CircleAlert className="mx-auto h-8 w-8 text-amber-600" aria-hidden="true" />
        <h2 className="mt-4 font-display text-lg font-bold text-institutional">{tText("Messages could not be loaded.")}</h2>
        <div className="mt-5 flex justify-center gap-2">
          <button type="button" onClick={onRetry} className={actionClass}>{tText("Retry")}</button>
          <button type="button" onClick={onRefresh} className={actionClass}><RefreshCw className="h-4 w-4" aria-hidden="true" /> {tText("Refresh")}</button>
        </div>
      </div>
    </div>
  );
}

function MessageDetailError({ onBack, onRetry }: { onBack: () => void; onRetry: () => void }) {
  const { tText } = useLanguage();
  return (
    <div className="flex min-h-96 items-center justify-center px-6 py-10 text-center" role="alert">
      <div>
        <CircleAlert className="mx-auto h-8 w-8 text-amber-600" aria-hidden="true" />
        <h2 className="mt-4 font-display text-lg font-bold text-institutional">{tText("Message could not be opened.")}</h2>
        <div className="mt-5 flex justify-center gap-2">
          <button type="button" onClick={onBack} className={actionClass}><ArrowLeft className="h-4 w-4" aria-hidden="true" /> {tText("Back to Inbox")}</button>
          <button type="button" onClick={onRetry} className={actionClass}>{tText("Retry")}</button>
        </div>
      </div>
    </div>
  );
}

function MessageListSkeleton() {
  const { tText } = useLanguage();
  return (
    <div className="divide-y divide-slate-200" role="status" aria-label={tText("Loading messages")}>
      {Array.from({ length: 7 }, (_, index) => (
        <div key={index} className="grid animate-pulse grid-cols-[1rem_1rem_minmax(0,1fr)] items-center gap-3 px-4 py-4">
          <div className="h-4 w-4 rounded bg-slate-200" />
          <div className="h-4 w-4 rounded bg-slate-100" />
          <div className="grid gap-3 md:grid-cols-[9rem_minmax(0,1fr)_4rem]">
            <div className="h-4 rounded bg-slate-200" />
            <div className="h-4 rounded bg-slate-100" />
            <div className="h-3 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessageDetailSkeleton() {
  const { tText } = useLanguage();
  return (
    <div className="animate-pulse space-y-6 p-6" role="status" aria-label={tText("Loading message details")}>
      <div className="h-9 w-36 rounded bg-slate-200" />
      <div className="h-8 w-3/4 rounded bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-16 rounded bg-slate-100" />
        <div className="h-16 rounded bg-slate-100" />
        <div className="h-16 rounded bg-slate-100" />
      </div>
      <div className="h-52 rounded bg-slate-100" />
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string | null }) {
  const { tText } = useLanguage();
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-700">{value || tText("Not provided")}</dd>
    </div>
  );
}

function labelize(value: string) {
  return value.replaceAll("-", " ").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function purposeLabel(value: string) {
  return contactPurposeOptions.find((purpose) => purpose.value === value)?.label ?? labelize(value);
}

function dateKey(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: "Africa/Douala" });
}

function formatListDate(value: string, language: "en" | "fr") {
  const date = new Date(value);
  const now = new Date();
  const yesterday = new Date(now.getTime() - 86_400_000);
  if (dateKey(date) === dateKey(now)) {
    return date.toLocaleTimeString(language === "fr" ? "fr-CM" : "en-CM", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Douala" });
  }
  if (dateKey(date) === dateKey(yesterday)) return language === "fr" ? "Hier" : "Yesterday";
  return date.toLocaleDateString(language === "fr" ? "fr-CM" : "en-CM", { day: "2-digit", month: "short", year: "numeric", timeZone: "Africa/Douala" });
}

function formatFullDate(value: string, language: "en" | "fr") {
  return new Intl.DateTimeFormat(language === "fr" ? "fr-CM" : "en-CM", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Douala",
    timeZoneName: "short",
  }).format(new Date(value));
}
