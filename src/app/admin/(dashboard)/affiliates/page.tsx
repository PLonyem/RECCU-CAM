"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, Upload, CheckCircle2, AlertCircle, Eye, Power } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AdminDataFailure } from "@/components/admin/AdminDataFailure";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { regions, regionLabels } from "@/data/admin-options";
import { useLanguage } from "@/context/LanguageContext";
import { requestAdminData } from "@/lib/admin-data-client";
import { slugify } from "@/lib/slug";

interface AffiliateRow {
  id: string;
  code: string;
  name: string;
  region: string;
  city: string | null;
  phone: string | null;
  isActive: boolean;
  profileStatus: string;
}

interface ListResponse {
  affiliates: AffiliateRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ImportResult {
  created: number;
  updated: number;
  errors: { row: number; message: string }[];
}

const LIMIT = 50;

function regionLabel(region: string): string {
  return regionLabels[region]?.en ?? region;
}

export default function AdminAffiliatesPage() {
  const { t, tText } = useLanguage();
  const [affiliates, setAffiliates] = useState<AffiliateRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AffiliateRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 whenever the filters change, and flag a reload whenever
  // the effective request (page + filters + manual refresh) changes.
  // Adjusted during render (React's documented pattern for this) rather
  // than in an effect, so it doesn't trigger a second, cascading render.
  const filterKey = `${debouncedSearch}|${region}|${status}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const requestKey = `${filterKey}|${page}|${refreshToken}`;
  const [prevRequestKey, setPrevRequestKey] = useState(requestKey);
  if (requestKey !== prevRequestKey) {
    setPrevRequestKey(requestKey);
    setIsLoading(true);
  }

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIMIT),
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (region) params.set("region", region);
    if (status) params.set("status", status);

    async function loadAffiliates() {
      try {
        const result = await requestAdminData<ListResponse>(`/api/admin/affiliates?${params.toString()}`);
        if (ignore) return;
        if (result.ok) {
          setAffiliates(result.data.affiliates);
          setTotal(result.data.total);
          setTotalPages(result.data.totalPages);
          setLoadError(null);
        } else {
          setLoadError(result.message);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadAffiliates();

    return () => {
      ignore = true;
    };
  }, [page, debouncedSearch, region, status, refreshToken]);

  function retryLoad() {
    setLoadError(null);
    setIsLoading(true);
    setRefreshToken((token) => token + 1);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await requestAdminData<{ success: true }>(
        `/api/admin/affiliates/${deleteTarget.id}`,
        { method: "DELETE" },
      );
      if (!result.ok) {
        setLoadError(result.message);
        return;
      }
      setDeleteTarget(null);
      setRefreshToken((token) => token + 1);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleImportFile(file: File) {
    setIsImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await requestAdminData<ImportResult>("/api/admin/affiliates/import", {
        method: "POST",
        body: formData,
      });

      if (result.ok) {
        setImportResult(result.data);
        setRefreshToken((token) => token + 1);
      } else {
        setImportResult({
          created: 0,
          updated: 0,
          errors: [{ row: 0, message: result.message }],
        });
      }
    } finally {
      setIsImporting(false);
    }
  }

  async function toggleActive(affiliate: AffiliateRow) {
    setUpdatingId(affiliate.id);
    try {
      const result = await requestAdminData<AffiliateRow>(`/api/admin/affiliates/${affiliate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !affiliate.isActive }),
      });
      if (!result.ok) {
        setLoadError(result.message);
        return;
      }
      setRefreshToken((token) => token + 1);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {importResult && (
        <div
          className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm border ${
            importResult.errors.length === 0
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-amber-50 border-amber-200 text-amber-700"
          }`}
        >
          {importResult.errors.length === 0 ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <div>
            <p>
              Import complete — {importResult.created} created,{" "}
              {importResult.updated} updated
              {importResult.errors.length > 0 &&
                `, ${importResult.errors.length} row(s) skipped`}
              .
            </p>
            {importResult.errors.length > 0 && (
              <ul className="mt-1 list-disc list-inside">
                {importResult.errors.slice(0, 5).map((e) => (
                  <li key={e.row}>
                    Row {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{t("admin.affiliates")}</h1>
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {isImporting ? "Importing..." : "Import CSV"}
          </Button>
          <Link
            href="/admin/affiliates/new"
            className={buttonVariants({ variant: "default" })}
          >
            <Plus className="h-4 w-4" />
            {t("admin.addAffiliate")}
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
          />
        </div>

        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {regionLabel(r)}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter affiliates by status"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="approved">Public profile approved</option>
          <option value="pending">Profile pending review</option>
          <option value="rejected">Profile rejected</option>
        </select>
      </div>

      {isLoading ? (
        <AdminLoadingState label="Loading affiliates" />
      ) : loadError ? (
        <AdminDataFailure message={loadError} onRetry={retryLoad} />
      ) : affiliates.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          No affiliates found.
        </div>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      {t("admin.code")}
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      {t("admin.affiliateName")}
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      {t("admin.region")}
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      {t("admin.city")}
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      {t("admin.phone")}
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      {t("admin.status")}
                    </th>
                    <th className="text-right font-medium text-gray-500 px-4 py-3">
                      {t("admin.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {affiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {affiliate.code}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">{affiliate.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="primary">{regionLabel(affiliate.region)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {affiliate.city ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {affiliate.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={affiliate.isActive ? "success" : "default"}>
                          {affiliate.isActive ? t("admin.active") : t("admin.inactive")}
                        </Badge>
                        <span className="mt-1 block text-xs capitalize text-gray-500">Profile: {affiliate.profileStatus}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/network/affiliates/${slugify(affiliate.code)}`}
                            className="text-gray-400 hover:text-primary-600 transition-colors"
                            aria-label={`${tText("View public profile")}: ${affiliate.name}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            disabled={updatingId === affiliate.id}
                            onClick={() => void toggleActive(affiliate)}
                            className="text-gray-400 hover:text-primary-600 transition-colors disabled:opacity-40"
                            aria-label={`${tText(affiliate.isActive ? "Deactivate" : "Activate")}: ${affiliate.name}`}
                          >
                            <Power className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/admin/affiliates/${affiliate.id}/edit`}
                            className="text-gray-400 hover:text-primary-600 transition-colors"
                            aria-label={t("admin.edit")}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(affiliate)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            aria-label={t("admin.delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: stacked cards */}
          <div className="md:hidden space-y-3">
            {affiliates.map((affiliate) => (
              <div
                key={affiliate.id}
                className="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">{affiliate.name}</p>
                    <p className="font-mono text-xs text-gray-500 mt-0.5">
                      {affiliate.code}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/network/affiliates/${slugify(affiliate.code)}`}
                      className="text-gray-400 hover:text-primary-600 transition-colors"
                      aria-label={`${tText("View public profile")}: ${affiliate.name}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      disabled={updatingId === affiliate.id}
                      onClick={() => void toggleActive(affiliate)}
                      className="text-gray-400 hover:text-primary-600 transition-colors disabled:opacity-40"
                      aria-label={`${tText(affiliate.isActive ? "Deactivate" : "Activate")}: ${affiliate.name}`}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/admin/affiliates/${affiliate.id}/edit`}
                      className="text-gray-400 hover:text-primary-600 transition-colors"
                      aria-label={t("admin.edit")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(affiliate)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      aria-label={t("admin.delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">{regionLabel(affiliate.region)}</Badge>
                  <Badge variant={affiliate.isActive ? "success" : "default"}>
                    {affiliate.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant={affiliate.profileStatus === "approved" ? "success" : "default"}>
                    Profile {affiliate.profileStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{affiliate.city ?? "—"}</span>
                  <span>{affiliate.phone ?? "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {total} affiliate{total === 1 ? "" : "s"} — page {page} of{" "}
            {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t("news_previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t("news_next")}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete affiliate?"
        description={`This will permanently delete "${deleteTarget?.name ?? ""}". This action cannot be undone.`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
