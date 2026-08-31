"use client";

import { useRouter } from "next/navigation";
import {
  AffiliateForm,
  buildAffiliatePayload,
  type AffiliateFormValues,
} from "@/components/admin/AffiliateForm";

export default function NewAffiliatePage() {
  const router = useRouter();

  async function handleCreate(values: AffiliateFormValues) {
    const res = await fetch("/api/admin/affiliates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildAffiliatePayload(values)),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return body?.error ?? "Something went wrong. Please try again.";
    }

    router.push("/admin/affiliates");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">New Affiliate</h1>
      <AffiliateForm onSubmit={handleCreate} />
    </div>
  );
}
