import Link from "next/link";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { getPublicAffiliates } from "@/lib/data/public-affiliates";

export async function AffiliatePreview() {
  const affiliates = await getPublicAffiliates();
  return (
    <div>
      {affiliates.length > 0 ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {affiliates.slice(0, 6).map((affiliate) => (
          <Card key={affiliate.id} padding="default" className="group flex h-full flex-col transition-[border-color,box-shadow,transform] duration-base motion-safe:hover:-translate-y-1 hover:border-primary-200 hover:shadow-raised">
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-control bg-primary-50 text-forest" aria-hidden="true"><Building2 className="h-5 w-5" /></span>
              <Badge variant="success">Verified profile</Badge>
            </div>
            <h3 className="mt-5 font-display text-h4 text-institutional">{affiliate.name}</h3>
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-gold-strong" aria-hidden="true" /> {[affiliate.city, affiliate.region].filter(Boolean).join(", ") || "Location not published"}</p>
            <Link href={`/network/affiliates/${affiliate.slug}`} className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest">
              View profile <ArrowRight className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </Card>
        ))}
      </div> : <Card padding="default" className="text-center text-sm text-muted-foreground">No affiliates found.</Card>}
      <div className="mt-8 flex justify-center">
        <Link href="/network/affiliates" className={buttonVariants({ variant: "secondary", size: "lg" })}>
          Browse All Affiliates <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
