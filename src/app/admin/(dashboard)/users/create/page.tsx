"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Info, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface ChapterOption { id: string; name: string }
interface RegionOption { id: string; name: string; chapters: ChapterOption[] }

interface FormState {
  name: string;
  code: string;
  regionId: string;
  chapterId: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  password: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  code: "",
  regionId: "",
  chapterId: "",
  city: "",
  address: "",
  phone: "",
  email: "",
  password: "",
};

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";
const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500 disabled:opacity-60";

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const values = new Uint32Array(16);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

export default function CreateNewCreditUnionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRegionId = searchParams.get("regionId") ?? "";
  const requestedChapterId = searchParams.get("chapterId") ?? "";
  const [regions, setRegions] = useState<RegionOption[]>([]);
  const [isLoadingHierarchy, setIsLoadingHierarchy] = useState(true);
  const [form, setForm] = useState<FormState>(() => ({ ...EMPTY_FORM, regionId: requestedRegionId, chapterId: requestedChapterId }));
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/credit-unions", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.error ?? "Could not load regions and chapters.");
        return body.regions as RegionOption[];
      })
      .then((items) => { if (!ignore) setRegions(items ?? []); })
      .catch((caught) => { if (!ignore) setError(caught instanceof Error ? caught.message : "Could not load regions and chapters."); })
      .finally(() => { if (!ignore) setIsLoadingHierarchy(false); });
    return () => { ignore = true; };
  }, []);

  const selectedRegion = regions.find((region) => region.id === form.regionId);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateRegion(regionId: string) {
    setForm((current) => ({ ...current, regionId, chapterId: "" }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setToast(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/credit-unions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Could not create the credit union.");

      if (!body.emailSent) {
        setError(
          `The credit union and account were created, but the credentials email failed. Record this temporary password now: ${form.password}`
        );
        return;
      }

      setToast("Credit union and account created. Credentials emailed.");
      window.setTimeout(() => router.push("/admin/chapters"), 1300);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create the credit union.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      {toast && (
        <div className="fixed right-5 top-20 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <CheckCircle2 className="h-5 w-5" />
          {toast}
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900">Create New Credit Union</h1>
      <p className="mt-1 text-sm text-gray-500">
        Create a credit union and its login account in one step.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-primary-900">Credit Union Information</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="name" className={labelClass}>Credit Union Name *</label>
              <input id="name" required value={form.name} onChange={(e) => updateField("name", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="code" className={labelClass}>Code *</label>
              <input id="code" required placeholder="e.g., BCCU-003" value={form.code} onChange={(e) => updateField("code", e.target.value.toUpperCase())} className={inputClass} />
            </div>
            <div>
              <label htmlFor="region" className={labelClass}>Region *</label>
              <select id="region" required disabled={isLoadingHierarchy} value={form.regionId} onChange={(e) => updateRegion(e.target.value)} className={inputClass}>
                <option value="">— Select a Region —</option>
                {regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="chapter" className={labelClass}>Chapter *</label>
              <select id="chapter" required disabled={!selectedRegion || isLoadingHierarchy} value={form.chapterId} onChange={(e) => updateField("chapterId", e.target.value)} className={inputClass}>
                <option value="">— Select a Chapter —</option>
                {selectedRegion?.chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="city" className={labelClass}>City/Town</label>
              <input id="city" value={form.city} onChange={(e) => updateField("city", e.target.value)} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className={labelClass}>Address</label>
              <input id="address" value={form.address} onChange={(e) => updateField("address", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Phone</label>
              <input id="phone" type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className={inputClass} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-primary-900">Account Credentials</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="email" className={labelClass}>Login Email *</label>
              <input id="email" type="email" required value={form.email} onChange={(e) => updateField("email", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>Password *</label>
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <input id="password" type={showPassword ? "text" : "password"} required minLength={8} value={form.password} onChange={(e) => updateField("password", e.target.value)} className={`${inputClass} pr-10`} />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button type="button" variant="outline" onClick={() => { updateField("password", generatePassword()); setShowPassword(true); }}>
                  <KeyRound className="h-4 w-4" /> Generate
                </Button>
              </div>
              <p className="mt-1 text-xs text-gray-500">At least 8 characters. You can enter one manually or generate it.</p>
            </div>
          </div>
        </Card>

        <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-900">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
            <p>The credit union will receive an email with their login credentials.</p>
          </div>
        </div>

        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full justify-center md:w-auto">
          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : "Create Credit Union + Account"}
        </Button>
      </form>
    </div>
  );
}
