"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Building2, ChevronDown, KeyRound, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface CreditUnionRow {
  id: string;
  code: string;
  name: string;
  email: string | null;
  status: "Active" | "Inactive" | "No Account";
}

interface ChapterGroup {
  id: string;
  name: string;
  creditUnions: CreditUnionRow[];
}

interface RegionGroup {
  id: string;
  name: string;
  chapters: ChapterGroup[];
}

async function fetchHierarchy(): Promise<RegionGroup[]> {
  const response = await fetch("/api/admin/credit-unions", { cache: "no-store" });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error ?? "Could not load credit unions.");
  return body.regions ?? [];
}

export default function ChaptersPage() {
  const [regions, setRegions] = useState<RegionGroup[]>([]);
  const [openRegions, setOpenRegions] = useState<Set<string>>(new Set());
  const [openChapters, setOpenChapters] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadHierarchy = useCallback(async () => {
    setIsLoading(true);
    try {
      setRegions(await fetchHierarchy());
    } catch (caught) {
      setMessage({ type: "error", text: caught instanceof Error ? caught.message : "Could not load credit unions." });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchHierarchy()
      .then((rows) => { if (!ignore) setRegions(rows); })
      .catch((caught) => {
        if (!ignore) setMessage({ type: "error", text: caught instanceof Error ? caught.message : "Could not load credit unions." });
      })
      .finally(() => { if (!ignore) setIsLoading(false); });
    return () => { ignore = true; };
  }, []);

  function toggleRegion(regionId: string) {
    setOpenRegions((current) => {
      const next = new Set(current);
      if (next.has(regionId)) next.delete(regionId); else next.add(regionId);
      return next;
    });
  }

  function toggleChapter(chapter: string) {
    setOpenChapters((current) => {
      const next = new Set(current);
      if (next.has(chapter)) next.delete(chapter); else next.add(chapter);
      return next;
    });
  }

  async function deleteCreditUnion(creditUnion: CreditUnionRow) {
    if (!window.confirm(`Delete ${creditUnion.name} and its portal account? This cannot be undone.`)) return;
    setActiveAction(`delete-${creditUnion.id}`);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/credit-unions/${creditUnion.id}`, { method: "DELETE" });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Could not delete the credit union.");
      setMessage({ type: "success", text: `${creditUnion.name} was deleted.` });
      await loadHierarchy();
    } catch (caught) {
      setMessage({ type: "error", text: caught instanceof Error ? caught.message : "Could not delete the credit union." });
    } finally {
      setActiveAction(null);
    }
  }

  async function resetPassword(creditUnion: CreditUnionRow) {
    if (!window.confirm(`Reset the portal password for ${creditUnion.name}? Existing sessions will be signed out.`)) return;
    setActiveAction(`reset-${creditUnion.id}`);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/credit-unions/${creditUnion.id}/reset-password`, { method: "POST" });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Could not reset the password.");
      setMessage({
        type: body.emailSent ? "success" : "error",
        text: body.emailSent
          ? `A new password was emailed to ${creditUnion.email}.`
          : `Password reset, but email failed. Temporary password: ${body.password}`,
      });
    } catch (caught) {
      setMessage({ type: "error", text: caught instanceof Error ? caught.message : "Could not reset the password." });
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900">Chapters &amp; Credit Unions</h1>
      <p className="mt-1 text-sm text-gray-500">Manage 5 regions, 10 chapters, and the credit unions under each chapter.</p>

      {message && (
        <p className={cn("mt-5 rounded-lg border px-4 py-3 text-sm", message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700")}>{message.text}</p>
      )}

      <div className="mt-6 space-y-3">
        {regions.map((region) => {
          const regionIsOpen = openRegions.has(region.id);
          const regionCreditUnionCount = region.chapters.reduce((total, chapter) => total + chapter.creditUnions.length, 0);
          return (
            <Card key={region.id} className="overflow-hidden p-0">
              <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                <button type="button" onClick={() => toggleRegion(region.id)} aria-expanded={regionIsOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><Building2 className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <span className="block font-bold text-gray-900">{region.name}</span>
                    <span className="block text-sm text-gray-500">{region.chapters.length} chapters · {regionCreditUnionCount} credit {regionCreditUnionCount === 1 ? "union" : "unions"}</span>
                  </span>
                  <ChevronDown className={cn("ml-auto h-5 w-5 shrink-0 text-gray-400 transition-transform", regionIsOpen && "rotate-180")} />
                </button>
              </div>

              {regionIsOpen && (
                <div className="space-y-3 border-t border-gray-200 bg-gray-50 p-4">
                  {region.chapters.map((chapter) => {
                    const isOpen = openChapters.has(chapter.id);
                    return (
                      <div key={chapter.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                          <button type="button" onClick={() => toggleChapter(chapter.id)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                            <span className="font-semibold text-gray-900">{chapter.name}</span>
                            <Badge variant="default">{chapter.creditUnions.length} credit {chapter.creditUnions.length === 1 ? "union" : "unions"}</Badge>
                            <ChevronDown className={cn("ml-auto h-4 w-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
                          </button>
                          <Link href={`/admin/users/create?regionId=${region.id}&chapterId=${chapter.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}>
                            <Plus className="h-4 w-4" /> Add Credit Union
                          </Link>
                        </div>
                        {isOpen && (chapter.creditUnions.length === 0 ? (
                          <p className="border-t border-gray-100 px-5 py-8 text-center text-sm text-gray-500">No credit unions have been added to this chapter.</p>
                        ) : (
                          <div className="overflow-x-auto border-t border-gray-100">
                      <table className="w-full min-w-[850px] text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-3">Code</th><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                          {chapter.creditUnions.map((creditUnion) => (
                            <tr key={creditUnion.id} className="hover:bg-gray-50/70">
                              <td className="px-5 py-4 font-mono text-xs text-gray-600">{creditUnion.code}</td>
                              <td className="px-5 py-4 font-medium text-gray-900">{creditUnion.name}</td>
                              <td className="px-5 py-4 text-gray-600">{creditUnion.email ?? "—"}</td>
                              <td className="px-5 py-4"><Badge variant={creditUnion.status === "Active" ? "success" : creditUnion.status === "Inactive" ? "danger" : "default"}>{creditUnion.status}</Badge></td>
                              <td className="px-5 py-4"><div className="flex justify-end gap-1">
                                <Link href={`/admin/affiliates/${creditUnion.id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}><Pencil className="h-4 w-4" /> Edit</Link>
                                <Button type="button" variant="ghost" size="sm" disabled={activeAction === `reset-${creditUnion.id}` || creditUnion.status === "No Account"} onClick={() => resetPassword(creditUnion)}>{activeAction === `reset-${creditUnion.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Reset Password</Button>
                                <Button type="button" variant="ghost" size="sm" disabled={activeAction === `delete-${creditUnion.id}`} onClick={() => deleteCreditUnion(creditUnion)} className="text-red-600 hover:bg-red-50 hover:text-red-700">{activeAction === `delete-${creditUnion.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete</Button>
                              </div></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
      {isLoading && <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading hierarchy...</div>}
    </div>
  );
}
