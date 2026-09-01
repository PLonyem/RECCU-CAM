import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { networkAffiliates } from "@/data/affiliates";

const previewAffiliates = networkAffiliates.slice(0, 6);

export function NetworkPreview() {
  return (
    <Card padding="none" className="grid overflow-hidden lg:grid-cols-[1.25fr_.75fr]">
      <div className="relative min-h-[26rem] overflow-hidden bg-muted p-6 sm:min-h-[32rem] sm:p-8">
        <div className="absolute inset-0 text-primary-300 opacity-50 [background-image:radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] [background-size:2rem_2rem]" />
        <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-8 h-[calc(100%-4rem)] w-[calc(100%-4rem)] text-primary-100 drop-shadow-sm">
          <path fill="currentColor" stroke="currentColor" strokeWidth="1" className="stroke-primary-300" d="M45 3 61 9 67 22 63 35 72 48 68 64 58 77 54 94 41 97 34 82 24 70 29 53 20 41 28 27 31 12Z" />
        </svg>
        <div className="absolute left-5 top-5 max-w-xs rounded-control border border-border bg-surface/95 px-4 py-3 shadow-card backdrop-blur sm:left-7 sm:top-7">
          <p className="text-meta uppercase text-gold-strong">Illustrative network preview</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Points reflect source-listed towns, not live branch coordinates.</p>
        </div>
        {previewAffiliates.map((affiliate) => (
          <span
            key={affiliate.code}
            style={{ left: `${affiliate.mapPosition.x}%`, top: `${affiliate.mapPosition.y}%` }}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            aria-label={`${affiliate.shortName}, ${affiliate.city}`}
          >
            <span className="grid h-8 w-8 place-items-center rounded-pill border-4 border-white bg-brand text-white shadow-card sm:h-10 sm:w-10">
              <MapPin className="h-4 w-4" aria-hidden="true" />
            </span>
          </span>
        ))}
      </div>
      <div className="flex flex-col justify-between border-t border-border p-6 sm:p-8 lg:border-l lg:border-t-0">
        <div>
          <p className="text-meta uppercase text-gold-strong">Our Network</p>
          <h3 className="mt-3 font-display text-h3 text-institutional">Cooperative connection, made visible.</h3>
          <p className="mt-4 text-body text-muted-foreground">Explore a focused map experience built from the same source-labelled starter directory used across the public platform.</p>
          <ul className="mt-6 space-y-3">
            {previewAffiliates.slice(0, 4).map((affiliate) => (
              <li key={affiliate.code} className="flex items-center justify-between gap-4 border-b border-border pb-3 text-sm">
                <span className="font-semibold text-foreground">{affiliate.shortName}</span>
                <span className="text-muted-foreground">{affiliate.city}</span>
              </li>
            ))}
          </ul>
        </div>
        <Link href="/network/map" className={`${buttonVariants({ variant: "default" })} mt-8 self-start`}>
          View Full Network Map <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
