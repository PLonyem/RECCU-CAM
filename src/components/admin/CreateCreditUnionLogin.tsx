"use client";

import { useState } from "react";
import { Copy, Check, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface CreateCreditUnionLoginProps {
  affiliateId: string;
  affiliateName: string;
}

interface CreatedCredentials {
  email: string;
  password: string;
}

// A chapter can have more than one login (see the dashboard layout's own
// comment on this), so this deliberately doesn't try to show or manage
// existing logins — it's a one-way "create another" action, not a list.
export function CreateCreditUnionLogin({
  affiliateId,
  affiliateName,
}: CreateCreditUnionLoginProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedCredentials | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const res = await fetch(
      `/api/admin/affiliates/${affiliateId}/create-credit-union-login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      setError(body?.error ?? "Something went wrong. Please try again.");
      setIsSubmitting(false);
      return;
    }

    setCreated({ email: body.email, password: body.password });
    setIsSubmitting(false);
  }

  async function handleCopy() {
    if (!created) return;
    await navigator.clipboard.writeText(
      `Email: ${created.email}\nPassword: ${created.password}`
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function handleCreateAnother() {
    setCreated(null);
    setEmail("");
    setError(null);
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-1">
        <KeyRound className="h-4 w-4 text-primary-500" />
        <h2 className="font-semibold text-gray-900">Credit Union Login</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Create a sign-in for {affiliateName}. This creates a real Clerk
        account, already linked to this affiliate — no manual metadata setup
        needed afterward.
      </p>

      {created ? (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
            <p className="font-medium text-amber-800">
              Copy this now — the password won&rsquo;t be shown again.
            </p>
            <dl className="mt-3 space-y-1 font-mono text-xs text-gray-700">
              <div className="flex gap-2">
                <dt className="text-gray-500 w-16 shrink-0">Email</dt>
                <dd className="break-all">{created.email}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-500 w-16 shrink-0">Password</dt>
                <dd className="break-all">{created.password}</dd>
              </div>
            </dl>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy credentials
                </>
              )}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleCreateAnother}>
              Create another login
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            placeholder="chapter@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Login"}
          </Button>
        </form>
      )}

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </Card>
  );
}
