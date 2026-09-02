import Link from "next/link";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { networkAffiliates } from "@/data/affiliates";

const previewAffiliates = networkAffiliates.slice(0, 6);

export function NetworkPreview() {
  return (
    <Card padding="none" className="grid overflow-hidden lg:grid-cols-[1.25fr_.75fr]">
      <div className="relative overflow-hidden bg-institutional p-6 text-white sm:p-8 lg:p-10">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,#C9962A_1px,transparent_1px)] [background-size:2rem_2rem]" aria-hidden="true" />
        <div className="relative">
          <span className="grid h-12 w-12 place-items-center rounded-control bg-white/10 text-accent-300" aria-hidden="true"><Building2 className="h-6 w-6" /></span>
          <p className="mt-6 text-meta uppercase text-accent-300">Source-labelled directory</p>
          <h3 className="mt-3 max-w-xl font-display text-h3 text-white">Institutions presented with clear publication status.</h3>
          <p className="mt-4 max-w-xl text-body text-primary-100">Names and towns come from the cited public record. Branch coordinates are never inferred, and missing operational details remain unpublished.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {previewAffiliates.slice(0, 4).map((affiliate) => (
              <div key={affiliate.code} className="rounded-control border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{affiliate.shortName}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-primary-200"><MapPin className="h-4 w-4 text-accent-300" aria-hidden="true" /> {affiliate.city}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-between border-t border-border p-6 sm:p-8 lg:border-l lg:border-t-0">
        <div>
          <p className="text-meta uppercase text-gold-strong">Our Network</p>
          <h3 className="mt-3 font-display text-h3 text-institutional">Cooperative connection, made visible.</h3>
          <p className="mt-4 text-body text-muted-foreground">Use the directory for source-listed institutions and the map for locations only after verified coordinates are available.</p>
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
