"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Calculator,
  Check,
  ChevronDown,
  History,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

interface FeeRuleForm {
  id: string;
  nameEn: string;
  nameFr: string;
  kind: "fee" | "tax" | "insurance";
  calculationType: "fixed" | "percentage";
  amount?: number;
  rateBasisPoints?: number;
  calculationBase: "principal" | "interest" | "principal_and_interest";
  principalThreshold?: number;
  minimumAmount?: number;
  maximumAmount?: number;
  active: boolean;
}

interface VersionRow {
  id: string;
  version: number;
  minimumAmount: number;
  maximumAmount: number;
  availableTerms: number[];
  interestRateBasisPoints: number;
  interestPeriod: "annual" | "monthly";
  calculationMethod: "flat" | "reducing_balance";
  requiredSavingsBasisPoints: number;
  affordabilityBasisPoints: number | null;
  gracePeriodMonths: number;
  eligibilityDescriptionEn: string | null;
  eligibilityDescriptionFr: string | null;
  requiredDocuments: Array<{ en: string; fr: string }>;
  feeRules: FeeRuleForm[];
  effectiveFrom: string;
  effectiveTo: string | null;
  isPublished: boolean;
  changeReason: string | null;
  createdAt: string;
}

interface ProductRow {
  id: string;
  code: string;
  nameEn: string;
  nameFr: string;
  descriptionEn: string;
  descriptionFr: string;
  category: string;
  icon: string;
  isActive: boolean;
  versions: VersionRow[];
}

const blankForm = () => ({
  id: "",
  code: "",
  nameEn: "",
  nameFr: "",
  descriptionEn: "",
  descriptionFr: "",
  category: "",
  icon: "Landmark",
  isActive: false,
  minimumAmount: 0,
  maximumAmount: 0,
  terms: "",
  interestRate: "",
  interestPeriod: "annual" as "annual" | "monthly",
  calculationMethod: "reducing_balance" as "flat" | "reducing_balance",
  savingsPercentage: "",
  affordabilityPercentage: "",
  gracePeriodMonths: 0,
  eligibilityDescriptionEn: "",
  eligibilityDescriptionFr: "",
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: "",
  isPublished: false,
  changeReason: "",
  feeRules: [] as FeeRuleForm[],
});

type FormState = ReturnType<typeof blankForm>;

function currency(value: number) {
  return `FCFA ${value.toLocaleString("en-US")}`;
}

function latestVersion(product: ProductRow) {
  return product.versions.toSorted((a, b) => b.version - a.version)[0];
}

export default function LoanProductAdministrationPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(blankForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/loan-products")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load loan policies.");
        return response.json();
      })
      .then(setProducts)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load loan policies."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetch("/api/admin/loan-products")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load loan policies.");
        return response.json();
      })
      .then(setProducts)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load loan policies."))
      .finally(() => setLoading(false));
  }, []);

  function edit(product: ProductRow) {
    const version = latestVersion(product);
    if (!version) return;
    setForm({
      id: product.id,
      code: product.code,
      nameEn: product.nameEn,
      nameFr: product.nameFr,
      descriptionEn: product.descriptionEn,
      descriptionFr: product.descriptionFr,
      category: product.category,
      icon: product.icon,
      isActive: product.isActive,
      minimumAmount: version.minimumAmount,
      maximumAmount: version.maximumAmount,
      terms: version.availableTerms.join(", "),
      interestRate: String(version.interestRateBasisPoints / 100),
      interestPeriod: version.interestPeriod,
      calculationMethod: version.calculationMethod,
      savingsPercentage: String(version.requiredSavingsBasisPoints / 100),
      affordabilityPercentage: version.affordabilityBasisPoints == null ? "" : String(version.affordabilityBasisPoints / 100),
      gracePeriodMonths: version.gracePeriodMonths,
      eligibilityDescriptionEn: version.eligibilityDescriptionEn ?? "",
      eligibilityDescriptionFr: version.eligibilityDescriptionFr ?? "",
      effectiveFrom: new Date(version.effectiveFrom).toISOString().slice(0, 10),
      effectiveTo: version.effectiveTo ? new Date(version.effectiveTo).toISOString().slice(0, 10) : "",
      isPublished: version.isPublished,
      changeReason: "",
      feeRules: Array.isArray(version.feeRules) ? version.feeRules : [],
    });
    setShowForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addFee() {
    setForm((current) => ({
      ...current,
      feeRules: [...current.feeRules, {
        id: crypto.randomUUID(),
        nameEn: "",
        nameFr: "",
        kind: "fee",
        calculationType: "fixed",
        calculationBase: "principal",
        active: true,
      }],
    }));
  }

  function updateFee(index: number, patch: Partial<FeeRuleForm>) {
    setForm((current) => ({ ...current, feeRules: current.feeRules.map((fee, feeIndex) => feeIndex === index ? { ...fee, ...patch } : fee) }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const terms = form.terms.split(/[,\s]+/).map(Number).filter((value) => Number.isInteger(value) && value > 0);
    const payload = {
      ...(form.id ? { id: form.id } : {}),
      code: form.code.trim().toUpperCase(),
      nameEn: form.nameEn,
      nameFr: form.nameFr,
      descriptionEn: form.descriptionEn,
      descriptionFr: form.descriptionFr,
      category: form.category,
      icon: form.icon,
      isActive: form.isActive,
      minimumAmount: form.minimumAmount,
      maximumAmount: form.maximumAmount,
      availableTerms: [...new Set(terms)].toSorted((a, b) => a - b),
      interestRateBasisPoints: Math.round(Number(form.interestRate) * 100),
      interestPeriod: form.interestPeriod,
      calculationMethod: form.calculationMethod,
      requiredSavingsBasisPoints: Math.round(Number(form.savingsPercentage) * 100),
      affordabilityBasisPoints: form.affordabilityPercentage ? Math.round(Number(form.affordabilityPercentage) * 100) : null,
      gracePeriodMonths: form.gracePeriodMonths,
      eligibilityDescriptionEn: form.eligibilityDescriptionEn,
      eligibilityDescriptionFr: form.eligibilityDescriptionFr,
      requiredDocuments: [],
      feeRules: form.feeRules,
      effectiveFrom: form.effectiveFrom,
      effectiveTo: form.effectiveTo || null,
      isPublished: form.isPublished,
      changeReason: form.changeReason,
    };
    try {
      const response = await fetch("/api/admin/loan-products", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save policy.");
      setSuccess(form.id ? "A new immutable policy version was created." : "Loan product and its first policy version were created.");
      setForm(blankForm());
      setShowForm(false);
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save policy.");
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = "mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100";
  const areaClass = "mt-2 min-h-24 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CamCCUL Loan Calculator Administration</h1>
          <p className="mt-1 text-sm text-gray-500">Versioned network policies, products, rates, savings rules, fees and taxes.</p>
        </div>
        <div className="flex flex-wrap gap-2"><Link href="/admin/loan-products/overrides" className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800"><ShieldCheck className="h-4 w-4" />Affiliate Overrides</Link><button type="button" onClick={() => { setForm(blankForm()); setShowForm(true); setError(""); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"><Plus className="h-4 w-4" />New Loan Product</button></div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex items-center gap-3"><div className="rounded-lg bg-primary-50 p-2"><Calculator className="h-5 w-5 text-primary-700" /></div><div><p className="text-2xl font-bold">{products.length}</p><p className="text-sm text-gray-500">Configured products</p></div></div></div>
        <div className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex items-center gap-3"><div className="rounded-lg bg-emerald-50 p-2"><Check className="h-5 w-5 text-emerald-700" /></div><div><p className="text-2xl font-bold">{products.filter((item) => item.isActive && latestVersion(item)?.isPublished).length}</p><p className="text-sm text-gray-500">Public products</p></div></div></div>
        <div className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex items-center gap-3"><div className="rounded-lg bg-amber-50 p-2"><History className="h-5 w-5 text-amber-700" /></div><div><p className="text-2xl font-bold">{products.reduce((sum, item) => sum + item.versions.length, 0)}</p><p className="text-sm text-gray-500">Retained policy versions</p></div></div></div>
      </div>

      <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"><ShieldCheck className="h-5 w-5 shrink-0" /><p>Publishing a policy makes its financial rules available to anonymous simulations on its effective date. Editing a product creates a new version; existing versions and simulation snapshots remain unchanged for auditability.</p></div>

      {error && <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
      {success && <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><Check className="h-5 w-5 shrink-0" />{success}</div>}

      {showForm && <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">{form.id ? "Create New Policy Version" : "New Loan Product"}</h2><p className="mt-1 text-sm text-gray-500">No field below is treated as an official CamCCUL policy until explicitly published.</p></div><button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button></div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium">Product code<input required value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} placeholder="Configured code" className={fieldClass} /></label>
          <label className="text-sm font-medium">Category<input required value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Configured category" className={fieldClass} /></label>
          <label className="text-sm font-medium">Icon identifier<input value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})} className={fieldClass} /></label>
          <label className="text-sm font-medium">Product name — English<input required value={form.nameEn} onChange={e=>setForm({...form,nameEn:e.target.value})} className={fieldClass} /></label>
          <label className="text-sm font-medium">Nom du produit — Français<input required value={form.nameFr} onChange={e=>setForm({...form,nameFr:e.target.value})} className={fieldClass} /></label>
          <div className="flex items-end gap-5 pb-2"><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} />Product active</label><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.isPublished} onChange={e=>setForm({...form,isPublished:e.target.checked})} />Publish version</label></div>
          <label className="text-sm font-medium md:col-span-1 lg:col-span-2">Description — English<textarea required value={form.descriptionEn} onChange={e=>setForm({...form,descriptionEn:e.target.value})} className={areaClass} /></label>
          <label className="text-sm font-medium">Description — Français<textarea required value={form.descriptionFr} onChange={e=>setForm({...form,descriptionFr:e.target.value})} className={areaClass} /></label>
        </div>
        <div className="my-7 border-t border-gray-200" />
        <h3 className="font-bold">Financial policy</h3>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium">Minimum loan (FCFA)<input required type="number" min="1" value={form.minimumAmount||""} onChange={e=>setForm({...form,minimumAmount:Number(e.target.value)})} className={fieldClass} /></label>
          <label className="text-sm font-medium">Maximum loan (FCFA)<input required type="number" min="1" value={form.maximumAmount||""} onChange={e=>setForm({...form,maximumAmount:Number(e.target.value)})} className={fieldClass} /></label>
          <label className="text-sm font-medium">Available terms (months)<input required value={form.terms} onChange={e=>setForm({...form,terms:e.target.value})} placeholder="e.g. 6, 12, 18" className={fieldClass} /></label>
          <label className="text-sm font-medium">Interest rate (%)<input required type="number" min="0" step="0.01" value={form.interestRate} onChange={e=>setForm({...form,interestRate:e.target.value})} className={fieldClass} /></label>
          <label className="text-sm font-medium">Rate convention<select value={form.interestPeriod} onChange={e=>setForm({...form,interestPeriod:e.target.value as FormState["interestPeriod"]})} className={fieldClass}><option value="annual">Annual</option><option value="monthly">Monthly</option></select></label>
          <label className="text-sm font-medium">Calculation method<select value={form.calculationMethod} onChange={e=>setForm({...form,calculationMethod:e.target.value as FormState["calculationMethod"]})} className={fieldClass}><option value="reducing_balance">Reducing balance</option><option value="flat">Flat rate</option></select></label>
          <label className="text-sm font-medium">Required savings (%)<input required type="number" min="0" step="0.01" value={form.savingsPercentage} onChange={e=>setForm({...form,savingsPercentage:e.target.value})} className={fieldClass} /></label>
          <label className="text-sm font-medium">Affordability ceiling (%)<input type="number" min="0" step="0.01" value={form.affordabilityPercentage} onChange={e=>setForm({...form,affordabilityPercentage:e.target.value})} placeholder="Optional" className={fieldClass} /></label>
          <label className="text-sm font-medium">Effective from<input required type="date" value={form.effectiveFrom} onChange={e=>setForm({...form,effectiveFrom:e.target.value})} className={fieldClass} /></label>
          <label className="text-sm font-medium">Effective to<input type="date" value={form.effectiveTo} onChange={e=>setForm({...form,effectiveTo:e.target.value})} className={fieldClass} /></label>
          <label className="text-sm font-medium">Grace period (months)<input type="number" min="0" value={form.gracePeriodMonths} onChange={e=>setForm({...form,gracePeriodMonths:Number(e.target.value)})} className={fieldClass} /></label>
          <label className="text-sm font-medium">Change reason<input required value={form.changeReason} onChange={e=>setForm({...form,changeReason:e.target.value})} placeholder="Required for audit log" className={fieldClass} /></label>
          <label className="text-sm font-medium sm:col-span-2">Eligibility description — English<textarea value={form.eligibilityDescriptionEn} onChange={e=>setForm({...form,eligibilityDescriptionEn:e.target.value})} className={areaClass} /></label>
          <label className="text-sm font-medium sm:col-span-2">Description d’admissibilité — Français<textarea value={form.eligibilityDescriptionFr} onChange={e=>setForm({...form,eligibilityDescriptionFr:e.target.value})} className={areaClass} /></label>
        </div>
        <div className="my-7 border-t border-gray-200" />
        <div className="flex items-center justify-between"><div><h3 className="font-bold">Fees, taxes and insurance</h3><p className="mt-1 text-sm text-gray-500">Rules can be fixed or percentage-based, with an optional principal threshold and caps.</p></div><button type="button" onClick={addFee} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold"><Plus className="h-4 w-4" />Add charge</button></div>
        <div className="mt-4 space-y-4">{form.feeRules.map((fee,index)=><div key={fee.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="text-xs font-medium">Name — English<input required value={fee.nameEn} onChange={e=>updateFee(index,{nameEn:e.target.value})} className={fieldClass} /></label><label className="text-xs font-medium">Nom — Français<input required value={fee.nameFr} onChange={e=>updateFee(index,{nameFr:e.target.value})} className={fieldClass} /></label><label className="text-xs font-medium">Kind<select value={fee.kind} onChange={e=>updateFee(index,{kind:e.target.value as FeeRuleForm["kind"]})} className={fieldClass}><option value="fee">Fee</option><option value="tax">Tax</option><option value="insurance">Insurance</option></select></label><label className="text-xs font-medium">Type<select value={fee.calculationType} onChange={e=>updateFee(index,{calculationType:e.target.value as FeeRuleForm["calculationType"]})} className={fieldClass}><option value="fixed">Fixed FCFA</option><option value="percentage">Percentage</option></select></label><label className="text-xs font-medium">{fee.calculationType==="fixed"?"Amount (FCFA)":"Rate (%)"}<input required type="number" min="0" step={fee.calculationType==="fixed"?1:.01} value={fee.calculationType==="fixed"?(fee.amount??""):((fee.rateBasisPoints??0)/100||"")} onChange={e=>updateFee(index,fee.calculationType==="fixed"?{amount:Number(e.target.value)}:{rateBasisPoints:Math.round(Number(e.target.value)*100)})} className={fieldClass} /></label><label className="text-xs font-medium">Calculation base<select value={fee.calculationBase} onChange={e=>updateFee(index,{calculationBase:e.target.value as FeeRuleForm["calculationBase"]})} className={fieldClass}><option value="principal">Principal</option><option value="interest">Interest</option><option value="principal_and_interest">Principal + interest</option></select></label><label className="text-xs font-medium">Principal threshold<input type="number" min="0" value={fee.principalThreshold??""} onChange={e=>updateFee(index,{principalThreshold:e.target.value?Number(e.target.value):undefined})} className={fieldClass} /></label><div className="flex items-end justify-between pb-1"><label className="flex items-center gap-2 text-xs font-medium"><input type="checkbox" checked={fee.active} onChange={e=>updateFee(index,{active:e.target.checked})} />Active</label><button type="button" onClick={()=>setForm(current=>({...current,feeRules:current.feeRules.filter((_,i)=>i!==index)}))} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></div></div>)}</div>
        <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={()=>setShowForm(false)} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold">Cancel</button><button disabled={saving} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving?"Saving…":form.id?"Create Policy Version":"Create Product"}</button></div>
      </form>}

      {loading ? <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">Loading policies…</div> : products.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center"><Calculator className="mx-auto h-10 w-10 text-gray-300" /><h2 className="mt-4 font-bold">No loan products configured</h2><p className="mt-2 text-sm text-gray-500">Create a product, enter an approved policy, then explicitly activate and publish it.</p></div> : <div className="space-y-3">{products.map(product=>{const latest=latestVersion(product);return <div key={product.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white"><div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><div className="rounded-lg bg-primary-50 p-3"><Calculator className="h-5 w-5 text-primary-700" /></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{product.nameEn}</h2><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold">{product.code}</span><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${product.isActive&&latest?.isPublished?"bg-emerald-100 text-emerald-700":"bg-amber-100 text-amber-700"}`}>{product.isActive&&latest?.isPublished?"Public":"Not public"}</span></div>{latest&&<p className="mt-1 text-sm text-gray-500">Version {latest.version} · {currency(latest.minimumAmount)}–{currency(latest.maximumAmount)} · {latest.availableTerms.join(", ")} months · {latest.interestRateBasisPoints/100}% {latest.interestPeriod}</p>}</div></div><div className="flex gap-2"><button type="button" onClick={()=>setExpanded(expanded===product.id?null:product.id)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold"><History className="h-4 w-4" />History<ChevronDown className={`h-4 w-4 transition ${expanded===product.id?"rotate-180":""}`} /></button><button type="button" onClick={()=>edit(product)} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white"><Pencil className="h-4 w-4" />New version</button></div></div>{expanded===product.id&&<div className="overflow-x-auto border-t border-gray-200"><table className="w-full min-w-[780px] text-sm"><thead className="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">Version</th><th className="px-4 py-3">Effective</th><th className="px-4 py-3">Rate</th><th className="px-4 py-3">Savings</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Reason</th></tr></thead><tbody>{product.versions.map(version=><tr key={version.id} className="border-t border-gray-100"><td className="px-4 py-3 font-bold">v{version.version}</td><td className="px-4 py-3">{new Date(version.effectiveFrom).toLocaleDateString()}</td><td className="px-4 py-3">{version.interestRateBasisPoints/100}% {version.interestPeriod}</td><td className="px-4 py-3">{version.requiredSavingsBasisPoints/100}%</td><td className="px-4 py-3">{version.calculationMethod.replaceAll("_"," ")}</td><td className="px-4 py-3">{version.isPublished?"Published":"Draft"}</td><td className="px-4 py-3 text-gray-500">{version.changeReason??"—"}</td></tr>)}</tbody></table></div>}</div>})}</div>}
    </div>
  );
}
