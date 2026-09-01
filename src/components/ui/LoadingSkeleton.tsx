import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 3, ...props }: LoadingSkeletonProps) {
  return (
    <div role="status" aria-busy="true" className={cn("space-y-3", className)} {...props}>
      <span className="sr-only">Loading</span>
      <div className="h-5 w-2/5 animate-pulse rounded-control bg-muted" />
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={cn("h-3 animate-pulse rounded-pill bg-muted", index === lines - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}
