"use client";

import { Fragment, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Trash2, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";

interface MessageRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface ListResponse {
  messages: MessageRow[];
  total: number;
  unreadCount: number;
}

type StatusFilter = "all" | "unread" | "read";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MessageRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Flag a reload whenever the filter or a manual refresh changes. Adjusted
  // during render (React's documented pattern for this) rather than in an
  // effect, so it doesn't trigger a second, cascading render.
  const requestKey = `${status}|${refreshToken}`;
  const [prevRequestKey, setPrevRequestKey] = useState(requestKey);
  if (requestKey !== prevRequestKey) {
    setPrevRequestKey(requestKey);
    setIsLoading(true);
  }

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams({ limit: "100" });
    if (status !== "all") params.set("status", status);

    fetch(`/api/admin/messages?${params.toString()}`)
      .then((res) => res.json())
      .then((data: ListResponse) => {
        if (ignore) return;
        setMessages(data.messages);
        setUnreadCount(data.unreadCount);
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [status, refreshToken]);

  async function markAsRead(id: string) {
    setMarkingId(id);
    await fetch(`/api/admin/messages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    setMarkingId(null);
    setRefreshToken((t) => t + 1);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await fetch(`/api/admin/messages/${deleteTarget.id}`, {
      method: "DELETE",
    });
    setIsDeleting(false);
    setDeleteTarget(null);
    setExpandedId((current) => (current === deleteTarget.id ? null : current));
    setRefreshToken((t) => t + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        {unreadCount > 0 && (
          <Badge variant="danger">{unreadCount} unread</Badge>
        )}
      </div>

      <div className="flex gap-2">
        {(["all", "unread", "read"] as StatusFilter[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatus(option)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors",
              status === option
                ? "bg-primary-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          Loading...
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          No messages found
        </div>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-8 px-4 py-3" />
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      Name
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      Email
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      Subject
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      Date
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {messages.map((msg) => {
                    const isExpanded = expandedId === msg.id;
                    return (
                      <Fragment key={msg.id}>
                        <tr
                          onClick={() =>
                            setExpandedId(isExpanded ? null : msg.id)
                          }
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-gray-400">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <p
                              className={cn(
                                "text-gray-900",
                                !msg.isRead && "font-bold"
                              )}
                            >
                              {msg.name}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{msg.email}</td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                            {msg.subject}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {formatDate(msg.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  msg.isRead ? "bg-gray-300" : "bg-red-500"
                                )}
                              />
                              <span className="text-xs text-gray-500">
                                {msg.isRead ? "Read" : "Unread"}
                              </span>
                            </span>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="px-4 pb-4 bg-gray-50">
                              <div className="pl-8">
                                {msg.phone && (
                                  <a
                                    href={`tel:${msg.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 mb-2"
                                  >
                                    <Phone className="h-3.5 w-3.5" />
                                    {msg.phone}
                                  </a>
                                )}
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {msg.message}
                                </p>
                                <div className="mt-3 flex items-center gap-3">
                                  {!msg.isRead && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      disabled={markingId === msg.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(msg.id);
                                      }}
                                    >
                                      {markingId === msg.id
                                        ? "Marking..."
                                        : "Mark as Read"}
                                    </Button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteTarget(msg);
                                    }}
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </button>
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

          {/* Mobile: stacked, expandable cards */}
          <div className="md:hidden bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
            {messages.map((msg) => {
              const isExpanded = expandedId === msg.id;
              return (
                <div key={msg.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                    className="w-full text-left p-4 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-gray-900 truncate",
                          !msg.isRead && "font-bold"
                        )}
                      >
                        {msg.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {msg.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-gray-400">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          msg.isRead ? "bg-gray-300" : "bg-red-500"
                        )}
                      />
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <p className="text-xs text-gray-400 mb-2">
                        {msg.email} · {formatDate(msg.createdAt)}
                      </p>
                      {msg.phone && (
                        <a
                          href={`tel:${msg.phone}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 mb-2"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {msg.phone}
                        </a>
                      )}
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {msg.message}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        {!msg.isRead && (
                          <Button
                            type="button"
                            size="sm"
                            disabled={markingId === msg.id}
                            onClick={() => markAsRead(msg.id)}
                          >
                            {markingId === msg.id ? "Marking..." : "Mark as Read"}
                          </Button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(msg)}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete message?"
        description={`This will permanently delete the message from "${deleteTarget?.name ?? ""}". This action cannot be undone.`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
