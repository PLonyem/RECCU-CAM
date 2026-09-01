import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export function AffiliateDirectorySkeleton() {
  return (
    <div aria-label="Loading affiliate directory" className="space-y-7">
      <div className="rounded-panel border border-primary-100 bg-primary-50/70 p-6">
        <LoadingSkeleton lines={2} />
      </div>
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div className="h-5 w-32 animate-pulse rounded-pill bg-muted" />
        <div className="h-9 w-48 animate-pulse rounded-control bg-muted" />
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="rounded-card border border-border bg-surface p-card shadow-card">
            <LoadingSkeleton lines={4} />
          </div>
        ))}
      </div>
    </div>
  );
}
