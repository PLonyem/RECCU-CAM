"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { Archive, CheckCircle2, ExternalLink, FileText, Loader2, RotateCcw, Trash2, Upload } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { requestAdminData } from "@/lib/admin-data-client";

interface MediaAssetRow {
  id: string; fileName: string; fileUrl: string | null; fileType: string; fileSize: number | null;
  title: string; altText: string; caption: string | null; uploadedBy: string; storageState: string; createdAt: string;
}

export function MediaLibraryClient({ initialAssets }: { initialAssets: MediaAssetRow[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [filter, setFilter] = useState<"all" | "images" | "documents" | "archived">("all");
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaAssetRow | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const visible = assets.filter((asset) => filter === "all" || (filter === "archived" ? asset.storageState === "archived" : filter === "images" ? asset.fileType.startsWith("image/") && asset.storageState !== "archived" : !asset.fileType.startsWith("image/") && asset.storageState !== "archived"));

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true); setMessage(null);
    try {
      const result = await requestAdminData<MediaAssetRow>("/api/admin/media", { method: "POST", body: new FormData(event.currentTarget) });
      if (!result.ok) { setMessage({ type: "error", text: result.status === 503 ? "Media storage is not configured. Add the Supabase media storage variables to this deployment." : result.message }); return; }
      setAssets((current) => [result.data, ...current]);
      formRef.current?.reset();
      setMessage({ type: "success", text: "Media asset uploaded." });
    } finally { setIsSaving(false); }
  }

  async function setArchived(asset: MediaAssetRow, archived: boolean) {
    setBusyId(asset.id); setMessage(null);
    try {
      const result = await requestAdminData<MediaAssetRow>(`/api/admin/media/${asset.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archived }) });
      if (!result.ok) { setMessage({ type: "error", text: result.message }); return; }
      setAssets((current) => current.map((item) => item.id === asset.id ? result.data : item));
      setMessage({ type: "success", text: archived ? "Media asset archived." : "Media asset restored." });
    } finally { setBusyId(null); }
  }

  async function remove() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id); setMessage(null);
    try {
      const result = await requestAdminData<{ success: true }>(`/api/admin/media/${deleteTarget.id}`, { method: "DELETE" });
      if (!result.ok) { setMessage({ type: "error", text: result.message }); return; }
      setAssets((current) => current.filter((asset) => asset.id !== deleteTarget.id));
      setDeleteTarget(null); setMessage({ type: "success", text: "Media asset deleted." });
    } finally { setBusyId(null); }
  }

  return <div className="space-y-7">
    <header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">Reusable assets</p><h1 className="mt-2 font-display text-3xl font-bold text-institutional">Media Library</h1><p className="mt-2 text-slate-600">Upload reusable images and documents to the configured Supabase Storage media bucket.</p></header>
    {message && <p role="status" className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>{message.type === "success" && <CheckCircle2 className="h-4 w-4" />}{message.text}</p>}
    <Card className="p-6"><h2 className="font-semibold text-institutional">Upload media</h2><form ref={formRef} onSubmit={upload} className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700">Asset title<input required name="title" minLength={2} maxLength={180} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
      <label className="text-sm font-medium text-slate-700">Alternative text<input required name="altText" minLength={2} maxLength={300} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
      <label className="text-sm font-medium text-slate-700 sm:col-span-2">File (PDF, DOCX, JPG, PNG or WEBP; max 10MB)<input required name="file" type="file" accept=".pdf,.docx,image/jpeg,image/png,image/webp" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
      <label className="text-sm font-medium text-slate-700 sm:col-span-2">Caption (optional)<textarea name="caption" maxLength={1000} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
      <Button type="submit" disabled={isSaving} className="sm:col-span-2">{isSaving ? <><Loader2 className="h-4 w-4 animate-spin" />Uploading&hellip;</> : <><Upload className="h-4 w-4" />Upload asset</>}</Button>
    </form></Card>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter media assets">{(["all","images","documents","archived"] as const).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full border px-3 py-1.5 text-sm capitalize ${filter === value ? "border-primary-700 bg-primary-50 text-primary-800" : "border-slate-300 text-slate-600"}`}>{value}</button>)}</div>
    {visible.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((asset) => <Card key={asset.id} className="overflow-hidden">
      {asset.fileUrl && asset.fileType.startsWith("image/") ? <div className="relative aspect-video bg-slate-100"><Image src={asset.fileUrl} alt={asset.altText} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" unoptimized className="object-cover" /></div> : <div className="grid aspect-video place-items-center bg-slate-50"><FileText className="h-10 w-10 text-slate-300" aria-hidden="true" /></div>}
      <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{asset.title}</p><p className="mt-1 break-all text-xs text-slate-500">{asset.fileName} · {asset.fileSize ? `${Math.ceil(asset.fileSize / 1024)} KB` : "size unavailable"}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize text-slate-600">{asset.storageState}</span></div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">{asset.fileUrl && <a href={asset.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-forest hover:underline"><ExternalLink className="h-4 w-4" />Preview</a>}<button type="button" disabled={busyId === asset.id} onClick={() => void setArchived(asset, asset.storageState !== "archived")} className="inline-flex items-center gap-1 text-slate-600 hover:text-institutional disabled:opacity-40">{asset.storageState === "archived" ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}{asset.storageState === "archived" ? "Restore" : "Archive"}</button><button type="button" disabled={busyId === asset.id} onClick={() => setDeleteTarget(asset)} className="inline-flex items-center gap-1 text-red-600 disabled:opacity-40"><Trash2 className="h-4 w-4" />Delete</button></div></div>
    </Card>)}</div> : <Card className="p-8 text-center text-sm text-slate-500">No media assets yet.</Card>}
    <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} title="Delete media asset?" description={`This permanently deletes “${deleteTarget?.title ?? ""}” from storage and the library.`} isConfirming={busyId === deleteTarget?.id} onConfirm={remove} />
  </div>;
}
