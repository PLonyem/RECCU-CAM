"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { UserProfile } from "@clerk/nextjs";
import { Clock3, History, KeyRound, Loader2, MonitorSmartphone, Shield, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface SecuritySettings {
  minimumPasswordLength: 8 | 10 | 12 | 14;
  requireNumbers: boolean;
  requireSpecialCharacters: boolean;
  passwordExpiryDays: number;
  sessionTimeoutMinutes: number;
  maximumFailedAttempts: number;
  lockoutDurationMinutes: number;
}

const DEFAULT_SECURITY: SecuritySettings = {
  minimumPasswordLength: 8,
  requireNumbers: true,
  requireSpecialCharacters: false,
  passwordExpiryDays: 0,
  sessionTimeoutMinutes: 60,
  maximumFailedAttempts: 5,
  lockoutDurationMinutes: 15,
};

const inputClass = "mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} className={cn("relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2", checked ? "bg-primary-500" : "bg-gray-300")}>
      <span className={cn("mt-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform", checked ? "translate-x-5.5" : "translate-x-0.5")} />
    </button>
  );
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"account" | "security">("account");
  const [security, setSecurity] = useState<SecuritySettings>(DEFAULT_SECURITY);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/settings/security", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.error ?? "Could not load security settings.");
        if (!ignore) setSecurity(body);
      })
      .catch((caught) => { if (!ignore) setError(caught instanceof Error ? caught.message : "Could not load security settings."); })
      .finally(() => { if (!ignore) setIsLoading(false); });
    return () => { ignore = true; };
  }, []);

  function updateNumber(key: keyof SecuritySettings, value: string) {
    setSecurity((current) => ({ ...current, [key]: Number(value) }));
  }

  async function saveSecurity(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/settings/security", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(security),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Could not save security settings.");
      setSecurity(body);
      setToast(true);
      window.setTimeout(() => setToast(false), 2500);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save security settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl pb-24">
      {toast && <div className="fixed right-5 top-20 z-50 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">Security settings saved</div>}
      <div><h1 className="text-2xl font-bold text-gray-900">General Settings</h1><p className="mt-1 text-sm text-gray-500">Manage your administrator account and dashboard security preferences.</p></div>

      <div className="mt-6 flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        <button type="button" onClick={() => setActiveTab("account")} className={cn("flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors", activeTab === "account" ? "bg-primary-50 text-primary-700" : "text-gray-500 hover:bg-gray-50")}>Account Profile</button>
        <button type="button" onClick={() => setActiveTab("security")} className={cn("flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors", activeTab === "security" ? "bg-primary-50 text-primary-700" : "text-gray-500 hover:bg-gray-50")}><Shield className="mr-2 inline h-4 w-4" />Security</button>
      </div>

      {activeTab === "account" ? (
        <div className="mt-6 max-w-2xl"><UserProfile routing="hash" appearance={{ elements: { rootBox: "w-full", card: "shadow-none border border-gray-200 rounded-xl" } }} /></div>
      ) : (
        <form onSubmit={saveSecurity} className="mt-6 space-y-6">
          <div className="flex items-start gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><ShieldCheck className="h-6 w-6" /></span><div><h2 className="font-display text-xl font-bold text-primary-900">Security Settings</h2><p className="mt-1 text-sm text-gray-500">Manage access and security preferences for the admin dashboard.</p></div></div>

          {isLoading ? <div className="flex min-h-56 items-center justify-center text-gray-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading security settings...</div> : (
            <>
              <Card className="p-6">
                <div className="flex items-center gap-3"><KeyRound className="h-5 w-5 text-primary-600" /><h3 className="font-semibold text-gray-900">Password Policy</h3></div>
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Setting label="Minimum password length" helper="The minimum number of characters required for administrator passwords."><select value={security.minimumPasswordLength} onChange={(event) => setSecurity((current) => ({ ...current, minimumPasswordLength: Number(event.target.value) as SecuritySettings["minimumPasswordLength"] }))} className={inputClass}>{[8, 10, 12, 14].map((value) => <option key={value} value={value}>{value} characters</option>)}</select></Setting>
                  <Setting label="Password expiry (days)" helper="Enter 0 if passwords should never expire."><input type="number" min={0} max={3650} value={security.passwordExpiryDays} onChange={(event) => updateNumber("passwordExpiryDays", event.target.value)} className={inputClass} /></Setting>
                  <BooleanSetting label="Require numbers" helper="Passwords must contain at least one numeric character." checked={security.requireNumbers} onChange={() => setSecurity((current) => ({ ...current, requireNumbers: !current.requireNumbers }))} />
                  <BooleanSetting label="Require special characters" helper="Passwords must contain a symbol such as !, @, #, or $." checked={security.requireSpecialCharacters} onChange={() => setSecurity((current) => ({ ...current, requireSpecialCharacters: !current.requireSpecialCharacters }))} />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3"><Clock3 className="h-5 w-5 text-primary-600" /><h3 className="font-semibold text-gray-900">Session Management</h3></div>
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                  <Setting label="Session timeout (minutes)" helper="How long before an inactive admin is automatically signed out."><input type="number" min={5} max={1440} value={security.sessionTimeoutMinutes} onChange={(event) => updateNumber("sessionTimeoutMinutes", event.target.value)} className={inputClass} /></Setting>
                  <Setting label="Maximum failed login attempts" helper="Number of failed attempts before temporary lockout."><input type="number" min={1} max={20} value={security.maximumFailedAttempts} onChange={(event) => updateNumber("maximumFailedAttempts", event.target.value)} className={inputClass} /></Setting>
                  <Setting label="Lockout duration (minutes)" helper="How long a temporary account lockout should remain active."><input type="number" min={1} max={1440} value={security.lockoutDurationMinutes} onChange={(event) => updateNumber("lockoutDurationMinutes", event.target.value)} className={inputClass} /></Setting>
                </div>
                <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">Password strength and failed-login lockouts are enforced by the connected identity provider. These preferences document CamCCUL policy for that configuration.</p>
              </Card>

              <Card className="p-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-6 w-6 text-primary-600" /><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3><Badge variant="warning">Coming Soon</Badge></div><p className="mt-1 text-sm text-gray-500">Two-factor authentication adds an extra layer of security to your account.</p></div></div><Button type="button" variant="outline" disabled>Enable 2FA</Button></div>
              </Card>

              <Card className="overflow-hidden p-0">
                <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5"><MonitorSmartphone className="h-5 w-5 text-primary-600" /><div><h3 className="font-semibold text-gray-900">Active Sessions</h3><p className="mt-0.5 text-sm text-gray-500">Review devices currently signed in to the admin dashboard.</p></div></div>
                <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-6 py-3">Device</th><th className="px-6 py-3">Location</th><th className="px-6 py-3">Last active</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Action</th></tr></thead></table></div>
                <p className="px-6 py-8 text-center text-sm text-gray-500">No active sessions to display.</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3"><History className="h-5 w-5 text-primary-600" /><h3 className="font-semibold text-gray-900">Audit Log Summary</h3></div>
                <div className="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200">{["Admin logged in — Aug 28, 2026", "Settings changed — Aug 27, 2026", "New credit union created — Aug 26, 2026"].map((event) => <p key={event} className="px-4 py-3 text-sm text-gray-600">{event}</p>)}</div>
                <Link href="/admin/settings#audit-log" className="mt-4 inline-flex text-sm font-medium text-primary-600 hover:text-primary-700">View Full Audit Log →</Link>
              </Card>
            </>
          )}

          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div className="sticky bottom-0 z-20 -mx-4 flex justify-end border-t border-gray-200 bg-white/95 px-4 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur"><Button type="submit" disabled={isSaving || isLoading}>{isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save Settings"}</Button></div>
        </form>
      )}
    </div>
  );
}

function Setting({ label, helper, children }: { label: string; helper: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700">{label}{children}<span className="mt-1.5 block text-xs font-normal leading-5 text-gray-500">{helper}</span></label>;
}

function BooleanSetting({ label, helper, checked, onChange }: { label: string; helper: string; checked: boolean; onChange: () => void }) {
  return <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4"><div><p className="text-sm font-medium text-gray-800">{label}</p><p className="mt-1 text-xs leading-5 text-gray-500">{helper}</p></div><Toggle checked={checked} onChange={onChange} label={`Toggle ${label}`} /></div>;
}
