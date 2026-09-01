import { BadgeCheck } from "lucide-react";

export function VerificationNote({ children }: { children: React.ReactNode }) {
  return (
    <aside className="flex gap-3 rounded-card border border-accent-200 bg-gold-subtle p-4 text-body text-institutional">
      <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold-strong" aria-hidden="true" />
      <div>{children}</div>
    </aside>
  );
}
