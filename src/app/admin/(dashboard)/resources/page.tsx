"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatCategory } from "@/lib/utils";

interface ResourceRow {
  id: string;
  title: string;
  category: string;
  fileType: string | null;
  downloadCount: number;
  isActive: boolean;
}

interface ListResponse {
  resources: ResourceRow[];
  total: number;
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<ResourceRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Flag a reload whenever refreshToken changes. Adjusted during render
  // (React's documented pattern for this) rather than in an effect, so it
  // doesn't trigger a second, cascading render.
  const [prevRefreshToken, setPrevRefreshToken] = useState(refreshToken);
  if (refreshToken !== prevRefreshToken) {
    setPrevRefreshToken(refreshToken);
    setIsLoading(true);
  }

  useEffect(() => {
    let ignore = false;

    fetch("/api/admin/resources?limit=100")
      .then((res) => res.json())
      .then((data: ListResponse) => {
        if (ignore) return;
        setResources(data.resources);
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [refreshToken]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await fetch(`/api/admin/resources/${deleteTarget.id}`, {
      method: "DELETE",
    });
    setIsDeleting(false);
    setDeleteTarget(null);
    setRefreshToken((t) => t + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <Link
          href="/admin/resources/new"
          className={buttonVariants({ variant: "default" })}
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          Loading...
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          No resources found
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
                      Title
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      Category
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      File Type
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      Downloads
                    </th>
                    <th className="text-left font-medium text-gray-500 px-4 py-3">
                      Status
                    </th>
                    <th className="text-right font-medium text-gray-500 px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">{resource.title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="primary">
                          {formatCategory(resource.category)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {resource.fileType ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {resource.downloadCount}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={resource.isActive ? "success" : "default"}>
                          {resource.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/resources/${resource.id}/edit`}
                            className="text-gray-400 hover:text-primary-600 transition-colors"
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(resource)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            aria-label="Delete"
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
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-gray-900">{resource.title}</p>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/admin/resources/${resource.id}/edit`}
                      className="text-gray-400 hover:text-primary-600 transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(resource)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">{formatCategory(resource.category)}</Badge>
                  <Badge variant={resource.isActive ? "success" : "default"}>
                    {resource.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{resource.fileType ?? "—"}</span>
                  <span>{resource.downloadCount} downloads</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete resource?"
        description={`This will permanently delete "${deleteTarget?.title ?? ""}". This action cannot be undone.`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
