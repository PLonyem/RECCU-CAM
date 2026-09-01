import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid h-11 w-11 place-items-center rounded-control bg-brand text-sm font-black text-white shadow-card",
        className,
      )}
    >
      R
      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-pill border-2 border-white bg-gold" />
      <span className="absolute -bottom-1 left-1 h-2.5 w-2.5 rounded-pill border-2 border-white bg-primary-300" />
    </span>
  );
}
