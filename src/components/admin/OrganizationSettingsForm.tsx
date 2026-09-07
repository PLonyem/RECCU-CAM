"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateOrganizationSettings, type WebsiteContentActionState } from "@/app/admin/(dashboard)/operations/actions";
import type { OrganizationSettingsInput } from "@/lib/validation/website-content";

const initialState: WebsiteContentActionState = { success: false, message: "", fieldErrors: {} };
const fields = [
  ["siteName", "Organization name", 100], ["fullName", "Legal / full name", 240], ["address", "Head office", 240],
  ["addressSecondary", "Additional address", 240], ["phone", "Public phone", 60], ["email", "Public email", 254],
  ["officeHours", "Office hours", 240], ["facebookUrl", "Facebook URL", 2048], ["linkedinUrl", "LinkedIn URL", 2048], ["twitterUrl", "X / Twitter URL", 2048],
] as const;

function SaveButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="rounded-lg bg-institutional px-4 py-2.5 font-semibold text-white disabled:opacity-60 sm:col-span-2">{pending ? "Saving..." : "Save verified settings"}</button>;
}

export function OrganizationSettingsForm({ settings }: { settings: OrganizationSettingsInput }) {
  const [state, action] = useActionState(updateOrganizationSettings, initialState);
  return <form action={action} noValidate className="grid gap-5 sm:grid-cols-2">
    {state.message && <p role="status" className={`rounded-lg border px-4 py-3 text-sm sm:col-span-2 ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>{state.message}</p>}
    {fields.map(([name, label, maxLength]) => <label key={name} className={`text-sm font-semibold text-slate-700 ${name === "fullName" || name === "address" ? "sm:col-span-2" : ""}`}>{label}
      <input name={name} defaultValue={settings[name]} maxLength={maxLength} required={["siteName", "fullName", "address"].includes(name)} type={name === "email" ? "email" : name.endsWith("Url") ? "url" : "text"} aria-invalid={Boolean(state.fieldErrors[name])} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm disabled:opacity-60" />
      <span className="mt-1 block min-h-4 text-xs font-normal text-red-600">{state.fieldErrors[name]?.[0]}</span>
    </label>)}
    <SaveButton />
  </form>;
}
