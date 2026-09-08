"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveHomepageSections, type WebsiteContentActionState } from "@/app/admin/(dashboard)/operations/actions";
import { Card } from "@/components/ui/Card";
import { defaultHomepageSections, type HomepageSectionsContent } from "@/data/homepage-cms";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

const initialState: WebsiteContentActionState = { success: false, message: "", fieldErrors: {} };
const field = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm disabled:opacity-60";
const error = "mt-1 min-h-4 text-xs font-normal text-red-600";

function SubmitButtons() {
  const { pending } = useFormStatus();
  const { tText } = useLanguage();
  return <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white/95 py-4">
    <button name="mode" value="draft" disabled={pending} className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 disabled:opacity-60">{pending ? tText("Saving...") : tText("Save Draft")}</button>
    <a href="/" target="_blank" className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700">{tText("Preview published")}</a>
    <button name="mode" value="publish" disabled={pending} className="rounded-lg bg-institutional px-5 py-2.5 font-semibold text-white disabled:opacity-60">{pending ? tText("Saving...") : tText("Publish")}</button>
  </div>;
}

export function HomepageSectionsEditor({ english, french, frenchPublished }: { english: HomepageSectionsContent; french: HomepageSectionsContent; frenchPublished: boolean }) {
  const { t } = useLanguage();
  const [locale, setLocale] = useState<"en" | "fr">("en");
  const frenchFields = [
    french.whoTitle, french.whoDescription, french.missionTitle, french.missionBody,
    french.visionTitle, french.visionBody,
    ...french.values.flatMap((value) => [value.title, value.description]),
    french.contactTitle, french.contactDescription, french.contactButtonText,
    ...(english.leaderName || english.leaderMessage ? [french.leaderRole, french.leaderMessage] : []),
  ];
  const missingFrenchFields = frenchFields.filter((value) => !value.trim()).length;
  const frenchComplete = frenchPublished && missingFrenchFields === 0;
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div><p className="font-semibold text-institutional">Editorial language</p><p className="text-xs text-slate-500">English remains the safe public fallback.</p></div>
      <div className="flex items-center gap-3"><span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", frenchComplete ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>{frenchComplete ? "FR Complete" : `FR Missing ${missingFrenchFields} field${missingFrenchFields === 1 ? "" : "s"}`}</span><div role="tablist" aria-label="Editorial language" className="inline-flex rounded-lg border border-slate-300 p-0.5">{(["en", "fr"] as const).map((item) => <button key={item} type="button" role="tab" aria-selected={locale === item} onClick={() => setLocale(item)} className={cn("rounded-md px-3 py-1.5 text-xs font-bold", locale === item ? "bg-institutional text-white" : "text-slate-600")}>{t(item === "en" ? "language.english" : "language.french")}</button>)}</div></div>
    </div>
    <div hidden={locale !== "en"}><HomepageSectionsForm data={english} locale="en" /></div>
    <div hidden={locale !== "fr"}><HomepageSectionsForm data={french} locale="fr" /></div>
  </div>;
}

export function HomepageSectionsForm({ data, locale = "en" }: { data: HomepageSectionsContent; locale?: "en" | "fr" }) {
  const [state, action] = useActionState(saveHomepageSections, initialState);
  const values = Array.from({ length: 5 }, (_, index) => data.values[index] ?? defaultHomepageSections.values[index]);
  const messageClass = state.success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700";
  const fieldError = (name: string) => state.fieldErrors[name]?.[0];

  return <form action={action} className="space-y-6">
    <input type="hidden" name="locale" value={locale} />
    {state.message && <p role="status" className={`rounded-lg border px-4 py-3 text-sm ${messageClass}`}>{state.message}</p>}
    <Card className="grid gap-5 p-6 sm:grid-cols-2">
      <label className="text-sm font-semibold">Who We Are title<input name="whoTitle" defaultValue={data.whoTitle} maxLength={180} aria-invalid={Boolean(fieldError("whoTitle"))} className={field} /><span className={error}>{fieldError("whoTitle")}</span></label>
      <label className="text-sm font-semibold sm:col-span-2">Who We Are description<textarea name="whoDescription" defaultValue={data.whoDescription} maxLength={2500} rows={3} aria-invalid={Boolean(fieldError("whoDescription"))} className={field} /><span className={error}>{fieldError("whoDescription")}</span></label>
      <label className="text-sm font-semibold">Mission title<input name="missionTitle" defaultValue={data.missionTitle} maxLength={180} aria-invalid={Boolean(fieldError("missionTitle"))} className={field} /><span className={error}>{fieldError("missionTitle")}</span></label>
      <label className="text-sm font-semibold sm:col-span-2">Mission body<textarea name="missionBody" defaultValue={data.missionBody} maxLength={2500} rows={3} aria-invalid={Boolean(fieldError("missionBody"))} className={field} /><span className={error}>{fieldError("missionBody")}</span></label>
      <label className="text-sm font-semibold">Vision title<input name="visionTitle" defaultValue={data.visionTitle} maxLength={180} aria-invalid={Boolean(fieldError("visionTitle"))} className={field} /><span className={error}>{fieldError("visionTitle")}</span></label>
      <label className="text-sm font-semibold sm:col-span-2">Vision body<textarea name="visionBody" defaultValue={data.visionBody} maxLength={2500} rows={3} aria-invalid={Boolean(fieldError("visionBody"))} className={field} /><span className={error}>{fieldError("visionBody")}</span></label>
    </Card>
    <Card className="p-6"><h2 className="font-semibold text-institutional">Institutional values</h2><div className="mt-5 grid gap-5 sm:grid-cols-2">{values.map((value, index) => <div key={index} className="rounded-lg border border-slate-200 p-4">
      <label className="text-sm font-semibold">Value {index + 1}<input name={`value${index + 1}Title`} defaultValue={value.title} maxLength={100} className={field} /><span className={error}>{fieldError(`value${index + 1}Title`)}</span></label>
      <label className="mt-3 block text-sm font-semibold">Description<textarea name={`value${index + 1}Description`} defaultValue={value.description} maxLength={500} rows={3} className={field} /><span className={error}>{fieldError(`value${index + 1}Description`)}</span></label>
    </div>)}</div></Card>
    <Card className="grid gap-5 p-6 sm:grid-cols-2">
      <label className="text-sm font-semibold">Leader name<input name="leaderName" defaultValue={data.leaderName} maxLength={160} className={field} /><span className={error}>{fieldError("leaderName")}</span></label>
      <label className="text-sm font-semibold">Role<input name="leaderRole" defaultValue={data.leaderRole} maxLength={160} className={field} /><span className={error}>{fieldError("leaderRole")}</span></label>
      <label className="text-sm font-semibold sm:col-span-2">Leadership message<textarea name="leaderMessage" defaultValue={data.leaderMessage} maxLength={2500} rows={4} className={field} /><span className={error}>{fieldError("leaderMessage")}</span></label>
      <label className="text-sm font-semibold">Contact CTA title<input name="contactTitle" defaultValue={data.contactTitle} maxLength={180} className={field} /><span className={error}>{fieldError("contactTitle")}</span></label>
      <label className="text-sm font-semibold">Button text<input name="contactButtonText" defaultValue={data.contactButtonText} maxLength={60} className={field} /><span className={error}>{fieldError("contactButtonText")}</span></label>
      <label className="text-sm font-semibold sm:col-span-2">Contact CTA description<textarea name="contactDescription" defaultValue={data.contactDescription} maxLength={1000} rows={3} className={field} /><span className={error}>{fieldError("contactDescription")}</span></label>
    </Card>
    <SubmitButtons />
  </form>;
}
