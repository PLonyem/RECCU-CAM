import { BadgeCheck } from "lucide-react";

export function VerificationNote({ children }: { children: React.ReactNode }) {
  return (
    <aside className="flex gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-4 text-sm leading-6 text-primary-900">
      <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" aria-hidden="true" />
      <div>{children}</div>
    </aside>
  );
}
