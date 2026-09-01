import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ExternalLink,
  Globe2,
  MapPin,
  Navigation,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { affiliateServiceCategories } from "@/data/affiliates/services";
import { getRegionById } from "@/data/affiliates/regions";
import type { Affiliate, InstitutionType } from "@/data/affiliates/types";
import { cn } from "@/lib/utils";

const institutionTypeLabels: Record<InstitutionType, string> = {
  "cooperative-credit-union": "Cooperative credit union",
  "thrift-and-loan-cooperative": "Thrift and loan cooperative",
  "other-cooperative-financial-institution": "Cooperative financial institution",
};

const serviceLabels = new Map(
  affiliateServiceCategories.map((service) => [service.slug, service.name]),
);

export function getInstitutionTypeLabel(type: InstitutionType) {
  return institutionTypeLabels[type];
}

export function getAffiliateLocation(affiliate: Affiliate) {
  const region = getRegionById(affiliate.region)?.name;
  return [affiliate.city, region].filter(Boolean).join(", ");
}

export function getDirectionsHref(affiliate: Affiliate) {
  const location = [
    affiliate.address,
    affiliate.city,
    getRegionById(affiliate.region)?.name,
    "Cameroon",
  ].filter(Boolean);

  if (location.length === 1) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.join(", "))}`;
}

export function AffiliateLogo({ affiliate, large = false }: { affiliate: Affiliate; large?: boolean }) {
  const sizeClass = large ? "h-20 w-20 rounded-panel" : "h-14 w-14 rounded-card";

  if (affiliate.logo) {
    return (
      <span className={cn("relative block shrink-0 overflow-hidden border border-border bg-surface", sizeClass)}>
        <Image
          src={affiliate.logo}
          alt={`${affiliate.name} logo`}
          fill
          sizes={large ? "80px" : "56px"}
          className="object-contain p-2"
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn("grid shrink-0 place-items-center bg-primary-50 text-forest", sizeClass)}
    >
      <Building2 className={large ? "h-8 w-8" : "h-6 w-6"} />
    </span>
  );
}

interface AffiliateCardProps {
  affiliate: Affiliate;
  view: "grid" | "list";
}

export function AffiliateCard({ affiliate, view }: AffiliateCardProps) {
  const location = getAffiliateLocation(affiliate);
  const directionsHref = getDirectionsHref(affiliate);
  const visibleServices = affiliate.services
    .map((service) => serviceLabels.get(service))
    .filter((service): service is string => Boolean(service));

  return (
    <article className="h-full">
      <Card
        padding="default"
        className={cn(
          "group flex h-full flex-col transition-[border-color,box-shadow,transform] duration-base motion-safe:hover:-translate-y-1 hover:border-primary-200 hover:shadow-raised",
          view === "list" && "sm:flex-row sm:gap-7",
        )}
      >
      <AffiliateLogo affiliate={affiliate} />

      <div className={cn("flex min-w-0 flex-1 flex-col", view === "grid" ? "mt-5" : "mt-5 sm:mt-0")}>
        <div className="flex flex-wrap items-center gap-2">
          {affiliate.acronym && <Badge variant="primary">{affiliate.acronym}</Badge>}
          {affiliate.institutionType && (
            <Badge>{getInstitutionTypeLabel(affiliate.institutionType)}</Badge>
          )}
        </div>

        <h2 className="mt-3 font-display text-h4 text-institutional">
          <Link
            href={`/network/affiliates/${affiliate.slug}`}
            className="rounded-sm transition-colors hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          >
            {affiliate.name}
          </Link>
        </h2>

        {affiliate.shortDescription && (
          <p className="mt-3 text-body text-muted-foreground">{affiliate.shortDescription}</p>
        )}

        {location && (
          <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-strong" aria-hidden="true" />
            <span>{location}</span>
          </p>
        )}

        {visibleServices.length > 0 && (
          <ul aria-label="Services" className="mt-4 flex flex-wrap gap-2">
            {visibleServices.map((service) => (
              <li key={service}>
                <Badge variant="accent">{service}</Badge>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-6 text-sm font-semibold">
          <Link
            href={`/network/affiliates/${affiliate.slug}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-sm text-forest transition-colors hover:text-institutional focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          >
            View Profile <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {affiliate.website && (
            <a
              href={affiliate.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-sm text-muted-foreground transition-colors hover:text-institutional focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
            >
              <Globe2 className="h-4 w-4" aria-hidden="true" /> Website
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
          {directionsHref && (
            <a
              href={directionsHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-sm text-muted-foreground transition-colors hover:text-institutional focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" /> Directions
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
      </Card>
    </article>
  );
}
