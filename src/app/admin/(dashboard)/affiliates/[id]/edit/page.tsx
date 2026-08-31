"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AffiliateForm,
  buildAffiliatePayload,
  type AffiliateFormValues,
} from "@/components/admin/AffiliateForm";
import { CreateCreditUnionLogin } from "@/components/admin/CreateCreditUnionLogin";

interface FetchedAffiliate {
  id: string;
  code: string;
  name: string;
  region: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
}

function toFormValues(affiliate: FetchedAffiliate): Partial<AffiliateFormValues> {
  return {
    code: affiliate.code,
    name: affiliate.name,
    region: affiliate.region,
    city: affiliate.city ?? "",
    address: affiliate.address ?? "",
    phone: affiliate.phone ?? "",
    email: affiliate.email ?? "",
    isActive: affiliate.isActive,
  };
}

export default function EditAffiliatePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const affiliateId = params.id;

  const [affiliate, setAffiliate] = useState<FetchedAffiliate | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    fetch(`/api/admin/affiliates/${affiliateId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Affiliate not found");
        return res.json();
      })
      .then((data: FetchedAffiliate) => {
        if (!ignore) setAffiliate(data);
      })
      .catch(() => {
        if (!ignore) setLoadError("Couldn't load this affiliate.");
      });

    return () => {
      ignore = true;
    };
  }, [affiliateId]);

  async function handleUpdate(values: AffiliateFormValues) {
    const res = await fetch(`/api/admin/affiliates/${affiliateId}`, {
      method: "PUT",
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
      <h1 className="text-2xl font-bold text-gray-900">Edit Affiliate</h1>

      {loadError && <p className="text-sm text-red-600">{loadError}</p>}

      {!affiliate && !loadError && (
        <p className="text-sm text-gray-400">Loading affiliate...</p>
      )}

      {affiliate && (
        <>
          <AffiliateForm
            defaultValues={toFormValues(affiliate)}
            onSubmit={handleUpdate}
          />
          <CreateCreditUnionLogin
            affiliateId={affiliate.id}
            affiliateName={affiliate.name}
          />
        </>
      )}
    </div>
  );
}
