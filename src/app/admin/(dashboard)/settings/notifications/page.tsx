"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  BadgeCheck,
  CheckCircle,
  ClipboardCheck,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  RefreshCw,
  UserPlus,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  type EmailTemplate,
  type EmailTemplates,
} from "@/lib/notification-settings";
import { cn } from "@/lib/utils";

type ToggleKey =
  | "newCreditUnionCreated"
  | "profileSubmittedForReview"
  | "profileUpdated"
  | "contactFormMessage"
  | "accountCredentialsEmail"
  | "profileSubmissionConfirmation"
  | "profileApprovedEmail"
  | "profileRejectedEmail";

interface NotificationSettingsState {
  adminNotificationEmail: string;
  newCreditUnionCreated: boolean;
  profileSubmittedForReview: boolean;
  profileUpdated: boolean;
  contactFormMessage: boolean;
  accountCredentialsEmail: boolean;
  profileSubmissionConfirmation: boolean;
  profileApprovedEmail: boolean;
  profileRejectedEmail: boolean;
  emailTemplates: EmailTemplates;
}

interface NotificationCardDefinition {
  key: ToggleKey;
  icon: LucideIcon;
  title: string;
  description: string;
  locked?: boolean;
  showEmail?: boolean;
}

const ADMIN_CARDS: NotificationCardDefinition[] = [
  { key: "newCreditUnionCreated", icon: UserPlus, title: "New Credit Union Created", description: "Receive an email when a new credit union account is created.", showEmail: true },
  { key: "profileSubmittedForReview", icon: ClipboardCheck, title: "Profile Submitted for Review", description: "Receive an email when a credit union submits their profile." },
  { key: "profileUpdated", icon: RefreshCw, title: "Profile Updated", description: "Receive an email when a credit union updates an approved profile." },
  { key: "contactFormMessage", icon: Mail, title: "Contact Form Submission", description: "Receive an email when someone submits the public contact form." },
];

const CREDIT_UNION_CARDS: NotificationCardDefinition[] = [
  { key: "accountCredentialsEmail", icon: KeyRound, title: "Account Credentials", description: "Send login credentials to credit unions when their account is created.", locked: true },
  { key: "profileSubmissionConfirmation", icon: CheckCircle, title: "Submission Confirmation", description: "Send a confirmation email when a credit union submits their profile." },
  { key: "profileApprovedEmail", icon: BadgeCheck, title: "Profile Approved", description: "Send an email when a credit union's profile is approved." },
  { key: "profileRejectedEmail", icon: XCircle, title: "Profile Rejected", description: "Send an email when a credit union's profile is rejected, including the reason." },
];

const initialSettings: NotificationSettingsState = {
  ...DEFAULT_NOTIFICATION_SETTINGS,
  emailTemplates: { ...DEFAULT_NOTIFICATION_SETTINGS.emailTemplates },
};

function Toggle({ checked, disabled, onChange, label }: { checked: boolean; disabled?: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        checked ? "bg-primary-500" : "bg-gray-300",
        disabled && "cursor-not-allowed opacity-70"
      )}
    >
      <span className={cn("mt-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform", checked ? "translate-x-5.5" : "translate-x-0.5")} />
    </button>
  );
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettingsState>(initialSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const [editingTemplateKey, setEditingTemplateKey] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/settings/notifications", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.error ?? "Could not load notification settings.");
        if (!ignore) setSettings(body);
      })
      .catch((caught) => { if (!ignore) setError(caught instanceof Error ? caught.message : "Could not load notification settings."); })
      .finally(() => { if (!ignore) setIsLoading(false); });
    return () => { ignore = true; };
  }, []);

  function toggle(key: ToggleKey) {
    if (key === "accountCredentialsEmail") return;
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  }

  function updateTemplate(key: string, field: "subject" | "body", value: string) {
    setSettings((current) => ({
      ...current,
      emailTemplates: {
        ...current.emailTemplates,
        [key]: { ...current.emailTemplates[key], [field]: value },
      },
    }));
  }

  async function saveSettings(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setToast(false);
    try {
      const response = await fetch("/api/admin/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, accountCredentialsEmail: true }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Could not save notification settings.");
      setSettings(body);
      setToast(true);
      window.setTimeout(() => setToast(false), 2500);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save notification settings.");
    } finally {
      setIsSaving(false);
    }
  }

  function renderCards(cards: NotificationCardDefinition[]) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {cards.map(({ key, icon: Icon, title, description, locked, showEmail }) => (
          <Card key={key} className="p-5">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><Icon className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div><h3 className="font-semibold text-gray-900">{title}</h3><p className="mt-1 text-sm leading-5 text-gray-500">{description}</p></div>
                  <Toggle checked={settings[key]} disabled={locked} onChange={() => toggle(key)} label={`Toggle ${title}`} />
                </div>
                {locked && <p className="mt-2 text-xs font-medium text-primary-700">Required for secure account delivery</p>}
                {showEmail && (
                  <label className="mt-4 block text-sm font-medium text-gray-700">Send to email:
                    <input type="email" required value={settings.adminNotificationEmail} onChange={(event) => setSettings((current) => ({ ...current, adminNotificationEmail: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500" />
                  </label>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (isLoading) return <div className="flex min-h-64 items-center justify-center text-gray-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading notification settings...</div>;

  return (
    <form onSubmit={saveSettings} className="mx-auto max-w-6xl space-y-8 pb-24">
      {toast && <div className="fixed right-5 top-20 z-50 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">Notification settings saved</div>}
      <div><h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1><p className="mt-1 text-sm text-gray-500">Configure how CamCCUL receives and sends notifications.</p></div>

      <section><h2 className="mb-4 font-display text-lg font-bold text-primary-900">Admin Notifications</h2>{renderCards(ADMIN_CARDS)}</section>
      <section><h2 className="mb-4 font-display text-lg font-bold text-primary-900">Credit Union Notifications</h2>{renderCards(CREDIT_UNION_CARDS)}</section>

      <section>
        <div className="mb-4"><h2 className="font-display text-lg font-bold text-primary-900">Custom Email Templates</h2><p className="mt-1 text-sm text-gray-500">Customize subjects and message bodies. Variables in braces are replaced when an email is sent.</p></div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Object.entries(settings.emailTemplates).map(([key, template]) => (
            <TemplateCard key={key} template={template} editing={editingTemplateKey === key} onEdit={() => setEditingTemplateKey(editingTemplateKey === key ? null : key)} onChange={(field, value) => updateTemplate(key, field, value)} />
          ))}
        </div>
      </section>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="sticky bottom-0 z-20 -mx-4 flex justify-end border-t border-gray-200 bg-white/95 px-4 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur">
        <Button type="submit" disabled={isSaving}>{isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save Settings"}</Button>
      </div>
    </form>
  );
}

function TemplateCard({ template, editing, onEdit, onChange }: { template: EmailTemplate; editing: boolean; onEdit: () => void; onChange: (field: "subject" | "body", value: string) => void }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-gray-900">{template.name}</h3><Button type="button" variant="ghost" size="sm" onClick={onEdit}><Pencil className="h-3.5 w-3.5" />{editing ? "Close Editor" : "Edit Template"}</Button></div>
      {editing ? (
        <div className="mt-4 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Subject<input value={template.subject} onChange={(event) => onChange("subject", event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal normal-case tracking-normal text-gray-900 outline-none focus:ring-2 focus:ring-primary-500" /></label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Body<textarea rows={6} value={template.body} onChange={(event) => onChange("body", event.target.value)} className="mt-1.5 w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal normal-case tracking-normal text-gray-900 outline-none focus:ring-2 focus:ring-primary-500" /></label>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4"><p className="text-sm font-semibold text-gray-800">{template.subject}</p><p className="mt-2 line-clamp-3 whitespace-pre-line text-xs leading-5 text-gray-500">{template.body}</p></div>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">{template.variables.map((variable) => <code key={variable} className="rounded bg-primary-50 px-1.5 py-1 text-[11px] text-primary-700">{variable}</code>)}</div>
    </Card>
  );
}
