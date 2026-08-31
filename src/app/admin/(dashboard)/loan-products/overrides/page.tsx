"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, Building2, Check, Save, ShieldCheck } from "lucide-react";

interface Version { id: string; version: number }
interface Product { id: string; code: string; nameEn: string; versions: Version[] }
interface Affiliate { id: string; code: string; name: string; city: string | null; region: string }
interface OverrideRow {
  id: string;
  affiliateId: string;
  loanProductVersionId: string;
  minimumAmount: number | null;
  maximumAmount: number | null;
  availableTerms: number[];
  interestRateBasisPoints: number | null;
  interestPeriod: "annual" | "monthly" | null;
  calculationMethod: "flat" | "reducing_balance" | null;
  requiredSavingsBasisPoints: number | null;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  changeReason: string | null;
  affiliate: { name: string; code: string };
  loanProduct: { nameEn: string; code: string };
  loanProductVersion: { version: number };
}

const initial = () => ({
  loanProductId: "",
  loanProductVersionId: "",
  affiliateId: "",
  minimumAmount: "",
  maximumAmount: "",
  availableTerms: "",
  interestRate: "",
  interestPeriod: "" as "" | "annual" | "monthly",
  calculationMethod: "" as "" | "flat" | "reducing_balance",
  savingsPercentage: "",
  isActive: true,
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: "",
  changeReason: "",
});

export default function AffiliateLoanOverridesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [overrides, setOverrides] = useState<OverrideRow[]>([]);
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function load() {
    fetch("/api/admin/loan-products/overrides")
      .then(async response => { if (!response.ok) throw new Error("Unable to load affiliate overrides."); return response.json(); })
      .then(data => { setProducts(data.products); setAffiliates(data.affiliates); setOverrides(data.overrides); })
      .catch(reason => setError(reason instanceof Error ? reason.message : "Unable to load affiliate overrides."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetch("/api/admin/loan-products/overrides")
      .then(async response => { if (!response.ok) throw new Error("Unable to load affiliate overrides."); return response.json(); })
      .then(data => { setProducts(data.products); setAffiliates(data.affiliates); setOverrides(data.overrides); })
      .catch(reason => setError(reason instanceof Error ? reason.message : "Unable to load affiliate overrides."))
      .finally(() => setLoading(false));
  }, []);

  const selectedProduct = useMemo(() => products.find(item => item.id === form.loanProductId), [products, form.loanProductId]);

  function selectProduct(productId: string) {
    const product = products.find(item => item.id === productId);
    setForm(current => ({ ...current, loanProductId: productId, loanProductVersionId: product?.versions[0]?.id ?? "" }));
  }

  function edit(row: OverrideRow) {
    const product = products.find(item => item.versions.some(version => version.id === row.loanProductVersionId));
    setForm({
      loanProductId: product?.id ?? "",
      loanProductVersionId: row.loanProductVersionId,
      affiliateId: row.affiliateId,
      minimumAmount: row.minimumAmount == null ? "" : String(row.minimumAmount),
      maximumAmount: row.maximumAmount == null ? "" : String(row.maximumAmount),
      availableTerms: row.availableTerms.join(", "),
      interestRate: row.interestRateBasisPoints == null ? "" : String(row.interestRateBasisPoints / 100),
      interestPeriod: row.interestPeriod ?? "",
      calculationMethod: row.calculationMethod ?? "",
      savingsPercentage: row.requiredSavingsBasisPoints == null ? "" : String(row.requiredSavingsBasisPoints / 100),
      isActive: row.isActive,
      effectiveFrom: new Date(row.effectiveFrom).toISOString().slice(0, 10),
      effectiveTo: row.effectiveTo ? new Date(row.effectiveTo).toISOString().slice(0, 10) : "",
      changeReason: "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError(""); setSuccess("");
    const nullableNumber = (value: string) => value === "" ? null : Number(value);
    const payload = {
      loanProductId: form.loanProductId,
      loanProductVersionId: form.loanProductVersionId,
      affiliateId: form.affiliateId,
      minimumAmount: nullableNumber(form.minimumAmount),
      maximumAmount: nullableNumber(form.maximumAmount),
      availableTerms: form.availableTerms.split(/[,\s]+/).map(Number).filter(value => Number.isInteger(value) && value > 0),
      interestRateBasisPoints: form.interestRate === "" ? null : Math.round(Number(form.interestRate) * 100),
      interestPeriod: form.interestPeriod || null,
      calculationMethod: form.calculationMethod || null,
      requiredSavingsBasisPoints: form.savingsPercentage === "" ? null : Math.round(Number(form.savingsPercentage) * 100),
      feeRules: null,
      isActive: form.isActive,
      effectiveFrom: form.effectiveFrom,
      effectiveTo: form.effectiveTo || null,
      changeReason: form.changeReason,
    };
    try {
      const response = await fetch("/api/admin/loan-products/overrides", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Unable to save override.");
      setSuccess("Affiliate policy override saved and recorded in the audit log."); setForm(initial()); load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save override."); }
    finally { setSaving(false); }
  }

  const field = "mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100";
  return <div className="space-y-6">
    <div><Link href="/admin/loan-products" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700"><ArrowLeft className="h-4 w-4" />Loan products</Link><h1 className="mt-3 text-2xl font-bold">Affiliate Policy Overrides</h1><p className="mt-1 text-sm text-gray-500">Override only the fields authorized for a participating credit union. Blank values inherit the product policy.</p></div>
    <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"><ShieldCheck className="h-5 w-5 shrink-0" />Resolution order: CamCCUL network policy → versioned loan-product policy → active affiliate override.</div>
    {error&&<div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle className="h-5 w-5" />{error}</div>}{success&&<div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><Check className="h-5 w-5" />{success}</div>}
    <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-6"><h2 className="font-bold">Configure override</h2><div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <label className="text-sm font-medium">Loan product<select required value={form.loanProductId} onChange={e=>selectProduct(e.target.value)} className={field}><option value="">Select product</option>{products.map(item=><option key={item.id} value={item.id}>{item.nameEn} ({item.code})</option>)}</select></label>
      <label className="text-sm font-medium">Policy version<select required value={form.loanProductVersionId} onChange={e=>setForm({...form,loanProductVersionId:e.target.value})} className={field}><option value="">Select version</option>{selectedProduct?.versions.map(version=><option key={version.id} value={version.id}>Version {version.version}</option>)}</select></label>
      <label className="text-sm font-medium">Affiliate<select required value={form.affiliateId} onChange={e=>setForm({...form,affiliateId:e.target.value})} className={field}><option value="">Select affiliate</option>{affiliates.map(item=><option key={item.id} value={item.id}>{item.name} ({item.code}) · {item.city??item.region}</option>)}</select></label>
      <label className="text-sm font-medium">Minimum loan (FCFA)<input type="number" min="1" value={form.minimumAmount} onChange={e=>setForm({...form,minimumAmount:e.target.value})} placeholder="Inherit" className={field} /></label>
      <label className="text-sm font-medium">Maximum loan (FCFA)<input type="number" min="1" value={form.maximumAmount} onChange={e=>setForm({...form,maximumAmount:e.target.value})} placeholder="Inherit" className={field} /></label>
      <label className="text-sm font-medium">Available terms<input value={form.availableTerms} onChange={e=>setForm({...form,availableTerms:e.target.value})} placeholder="Blank = inherit" className={field} /></label>
      <label className="text-sm font-medium">Interest rate (%)<input type="number" min="0" step="0.01" value={form.interestRate} onChange={e=>setForm({...form,interestRate:e.target.value})} placeholder="Inherit" className={field} /></label>
      <label className="text-sm font-medium">Rate convention<select value={form.interestPeriod} onChange={e=>setForm({...form,interestPeriod:e.target.value as typeof form.interestPeriod})} className={field}><option value="">Inherit</option><option value="annual">Annual</option><option value="monthly">Monthly</option></select></label>
      <label className="text-sm font-medium">Calculation method<select value={form.calculationMethod} onChange={e=>setForm({...form,calculationMethod:e.target.value as typeof form.calculationMethod})} className={field}><option value="">Inherit</option><option value="flat">Flat</option><option value="reducing_balance">Reducing balance</option></select></label>
      <label className="text-sm font-medium">Required savings (%)<input type="number" min="0" step="0.01" value={form.savingsPercentage} onChange={e=>setForm({...form,savingsPercentage:e.target.value})} placeholder="Inherit" className={field} /></label>
      <label className="text-sm font-medium">Effective from<input required type="date" value={form.effectiveFrom} onChange={e=>setForm({...form,effectiveFrom:e.target.value})} className={field} /></label>
      <label className="text-sm font-medium">Effective to<input type="date" value={form.effectiveTo} onChange={e=>setForm({...form,effectiveTo:e.target.value})} className={field} /></label>
      <label className="text-sm font-medium md:col-span-2">Reason / authorization reference<input required value={form.changeReason} onChange={e=>setForm({...form,changeReason:e.target.value})} className={field} /></label>
      <label className="flex items-end gap-2 pb-2 text-sm font-medium"><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} />Override active</label>
    </div><div className="mt-6 flex justify-end"><button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving?"Saving…":"Save override"}</button></div></form>
    <div className="rounded-xl border border-gray-200 bg-white"><div className="border-b border-gray-200 p-5"><h2 className="font-bold">Configured overrides</h2></div>{loading?<p className="p-8 text-center text-sm text-gray-500">Loading…</p>:overrides.length===0?<p className="p-8 text-center text-sm text-gray-500">No affiliate overrides configured.</p>:<div className="divide-y divide-gray-100">{overrides.map(row=><button type="button" onClick={()=>edit(row)} key={row.id} className="flex w-full flex-col gap-3 p-5 text-left hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><div className="rounded-lg bg-primary-50 p-2"><Building2 className="h-5 w-5 text-primary-700" /></div><div><p className="font-semibold">{row.affiliate.name} · {row.loanProduct.nameEn}</p><p className="mt-1 text-xs text-gray-500">{row.loanProduct.code} v{row.loanProductVersion.version} · {row.isActive?"Active":"Inactive"} · effective {new Date(row.effectiveFrom).toLocaleDateString()}</p></div></div><span className="text-sm font-semibold text-primary-700">Edit override</span></button>)}</div>}</div>
  </div>;
}
