"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const inputClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-forest focus:ring-2 focus:ring-primary-100";
const labelClass = "block text-sm font-semibold text-slate-700";

function useSubmission(endpoint: string) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  async function submit(payload: Record<string, string>) {
    setSubmitting(true); setResult(null);
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({}));
      setResult({ ok: response.ok, message: response.ok ? `Submitted successfully${data.reference ? ` — ${data.reference}` : "."}` : data.error ?? "Submission failed." });
      return response.ok;
    } catch { setResult({ ok: false, message: "The service is temporarily unavailable." }); return false; }
    finally { setSubmitting(false); }
  }
  return { submitting, result, submit };
}

function Result({ value }: { value: { ok: boolean; message: string } | null }) {
  if (!value) return null;
  return <p role="status" className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${value.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{value.ok && <CheckCircle2 className="h-4 w-4" />}{value.message}</p>;
}

export function ProfileUpdateForm({ initial }: { initial: { address: string; city: string; phone: string; email: string; website: string; description: string } }) {
  const state = useSubmission("/api/affiliate-portal/profile");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    await state.submit(values);
  }
  return <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
    {[["address", "Address"], ["city", "City / Town"], ["phone", "Telephone"], ["email", "Institutional email"], ["website", "Website"]].map(([name, label]) => <label key={name} className={labelClass}>{label}<input name={name} type={name === "email" ? "email" : name === "website" ? "url" : "text"} defaultValue={initial[name as keyof typeof initial]} className={inputClass} /></label>)}
    <label className={`${labelClass} sm:col-span-2`}>Institutional description<textarea name="description" defaultValue={initial.description} rows={5} className={inputClass} /></label>
    <div className="sm:col-span-2"><Button disabled={state.submitting} type="submit">{state.submitting && <Loader2 className="h-4 w-4 animate-spin" />}Submit update request</Button><Result value={state.result} /></div>
  </form>;
}

export function SupportRequestForm() {
  const state = useSubmission("/api/affiliate-portal/support");
  async function onSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const ok = await state.submit(Object.fromEntries(new FormData(form).entries()) as Record<string, string>); if (ok) form.reset(); }
  return <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
    <label className={`${labelClass} sm:col-span-2`}>Subject<input required minLength={4} maxLength={160} name="subject" className={inputClass} /></label>
    <label className={labelClass}>Category<select name="category" className={inputClass}>{[["general","General Support"],["compliance","Compliance"],["training","Training"],["technical","Technical"],["affiliate-banking","Affiliate Banking"],["network-administration","Network Administration"],["other","Other"]].map(([v,l]) => <option value={v} key={v}>{l}</option>)}</select></label>
    <label className={labelClass}>Priority<select name="priority" defaultValue="normal" className={inputClass}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
    <label className={`${labelClass} sm:col-span-2`}>Message<textarea required minLength={20} maxLength={5000} name="message" rows={6} className={inputClass} /></label>
    <div className="sm:col-span-2"><Button disabled={state.submitting} type="submit">{state.submitting && <Loader2 className="h-4 w-4 animate-spin" />}Create support request</Button><Result value={state.result} /></div>
  </form>;
}

export function BankingInquiryForm() {
  const state = useSubmission("/api/affiliate-portal/banking");
  async function onSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const ok = await state.submit(Object.fromEntries(new FormData(form).entries()) as Record<string, string>); if (ok) form.reset(); }
  return <form onSubmit={onSubmit} className="grid gap-5">
    <label className={labelClass}>Support category / subject<input required minLength={4} maxLength={160} name="subject" className={inputClass} /></label>
    <label className={labelClass}>Describe the institutional support required<textarea required minLength={20} maxLength={5000} name="message" rows={6} className={inputClass} /></label>
    <div><Button disabled={state.submitting} type="submit">{state.submitting && <Loader2 className="h-4 w-4 animate-spin" />}Submit inquiry</Button><Result value={state.result} /></div>
  </form>;
}
