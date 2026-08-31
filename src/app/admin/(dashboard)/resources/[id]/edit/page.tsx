"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ResourceForm,
  buildResourcePayload,
  type ResourceFormValues,
} from "@/components/admin/ResourceForm";

interface FetchedResource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileType: string | null;
  fileUrl: string | null;
  isActive: boolean;
}

function toFormValues(resource: FetchedResource): Partial<ResourceFormValues> {
  return {
    title: resource.title,
    description: resource.description ?? "",
    category: resource.category,
    fileType: resource.fileType ?? "",
    fileUrl: resource.fileUrl ?? "",
    isActive: resource.isActive,
  };
}

export default function EditResourcePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const resourceId = params.id;

  const [resource, setResource] = useState<FetchedResource | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    fetch(`/api/admin/resources/${resourceId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Resource not found");
        return res.json();
      })
      .then((data: FetchedResource) => {
        if (!ignore) setResource(data);
      })
      .catch(() => {
        if (!ignore) setLoadError("Couldn't load this resource.");
      });

    return () => {
      ignore = true;
    };
  }, [resourceId]);

  async function handleUpdate(values: ResourceFormValues) {
    const res = await fetch(`/api/admin/resources/${resourceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildResourcePayload(values)),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return body?.error ?? "Something went wrong. Please try again.";
    }

    router.push("/admin/resources");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Resource</h1>

      {loadError && <p className="text-sm text-red-600">{loadError}</p>}

      {!resource && !loadError && (
        <p className="text-sm text-gray-400">Loading resource...</p>
      )}

      {resource && (
        <ResourceForm
          defaultValues={toFormValues(resource)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}
