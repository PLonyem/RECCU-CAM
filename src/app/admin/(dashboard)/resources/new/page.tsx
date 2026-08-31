"use client";

import { useRouter } from "next/navigation";
import {
  ResourceForm,
  buildResourcePayload,
  type ResourceFormValues,
} from "@/components/admin/ResourceForm";

export default function NewResourcePage() {
  const router = useRouter();

  async function handleCreate(values: ResourceFormValues) {
    const res = await fetch("/api/admin/resources", {
      method: "POST",
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
      <h1 className="text-2xl font-bold text-gray-900">New Resource</h1>
      <ResourceForm onSubmit={handleCreate} />
    </div>
  );
}
