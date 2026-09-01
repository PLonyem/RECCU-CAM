import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  ExternalLink,
  Globe2,
  Mail,
  Map as MapIcon,
  MapPin,
  Navigation,
  Network,
  Phone,
} from "lucide-react";
import {
  AffiliateLogo,
  getAffiliateLocation,
  getDirectionsHref,
  getInstitutionTypeLabel,
} from "@/components/network/AffiliateCard";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Section } from "@/components/ui/Section";
import { Heading, Text } from "@/components/ui/Typography";
import {
  affiliateServiceCategories,
  affiliates,
  getAffiliateBySlug,
} from "@/data/affiliates";

interface Props {
  params: Promise<{ slug: string }>;
}

const serviceLabels = new Map(
  affiliateServiceCategories.map((service) => [service.slug, service.name]),
);

export function generateStaticParams() {
  return affiliates.map((affiliate) => ({ slug: affiliate.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const affiliate = getAffiliateBySlug(affiliates, slug);

  if (!affiliate) return { title: "Affiliate not found" };

  const location = getAffiliateLocation(affiliate);
  return {
    title: `${affiliate.acronym} | Affiliate Profile`,
    description: [affiliate.name, location ? `located in ${location}` : null, "in the RECCU-CAM network directory."].filter(Boolean).join(" "),
  };
}

export default async function AffiliateProfilePage({ params }: Props) {
  const { slug } = await params;
  const affiliate = getAffiliateBySlug(affiliates, slug);
  if (!affiliate) notFound();

  const location = getAffiliateLocation(affiliate);
  const directionsHref = getDirectionsHref(affiliate);
  const services = affiliate.services
    .map((service) => serviceLabels.get(service))
    .filter((service): service is string => Boolean(service));
  const hasContact = Boolean(affiliate.phone || affiliate.email || affiliate.website);

  return (
    <>
      <header className="relative overflow-hidden border-b border-white/10 bg-institutional py-section-sm text-white sm:py-section">
        <div aria-hidden="true" className="absolute -left-24 -top-24 h-72 w-72 rounded-pill bg-gold/15 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-32 right-0 h-80 w-80 rounded-pill bg-forest/30 blur-3xl" />
        <Container className="relative">
          <Link href="/network/affiliates" className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-primary-100 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-institutional">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to directory
          </Link>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            <AffiliateLogo affiliate={affiliate} large />
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                {affiliate.acronym && <Badge variant="accent">{affiliate.acronym}</Badge>}
                {affiliate.institutionType && <Badge>{getInstitutionTypeLabel(affiliate.institutionType)}</Badge>}
              </div>
              <h1 className="mt-4 max-w-4xl font-display text-h1 text-white">{affiliate.name}</h1>
              {location && (
                <p className="mt-5 flex items-center gap-2 text-lead text-primary-100">
                  <MapPin className="h-5 w-5 shrink-0 text-accent-300" aria-hidden="true" /> {location}
                </p>
              )}
            </div>
          </div>
        </Container>
      </header>

      <Section>
        <Container>
          <VerificationNote>
            This source-labelled profile contains only details supported by the cited public record. Confirm current membership, contact information, and branch location before making financial or travel decisions.
          </VerificationNote>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.75fr)]">
            <div className="space-y-8">
              <Card padding="spacious">
                <Heading as="h2" variant="h3">About</Heading>
                <Text className="mt-4">
                  {affiliate.shortDescription ?? `${affiliate.name} appears in the cited public source used for this starter directory. A fuller institutional description has not yet been verified for publication.`}
                </Text>
                {affiliate.source && (
                  <a href={affiliate.source.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-forest underline decoration-accent-400 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
                    View cited source <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </Card>

              <Card padding="spacious">
                <Heading as="h2" variant="h3">Services</Heading>
                {services.length > 0 ? (
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {services.map((service) => (
                      <li key={service} className="flex items-center gap-3 rounded-control bg-muted px-4 py-3 text-sm font-semibold text-institutional">
                        <span className="h-2 w-2 rounded-pill bg-gold" aria-hidden="true" /> {service}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState className="mt-5" icon={Building2} title="Service details awaiting verification" description="No institution-specific service list has been verified for this public profile." />
                )}
              </Card>

              <Card padding="spacious">
                <Heading as="h2" variant="h3">Location</Heading>
                {location ? (
                  <div className="mt-5 overflow-hidden rounded-panel border border-primary-100 bg-primary-50">
                    <div className="relative grid min-h-64 place-items-center overflow-hidden p-8 text-center">
                      <div aria-hidden="true" className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_center,theme(colors.primary.300)_1px,transparent_1px)] [background-size:20px_20px]" />
                      <div className="relative">
                        <span className="mx-auto grid h-14 w-14 place-items-center rounded-pill bg-institutional text-white shadow-raised"><MapPin className="h-6 w-6" /></span>
                        <p className="mt-4 font-display text-h4 text-institutional">{location}</p>
                        <p className="mt-2 text-sm text-muted-foreground">Town-level preview only; no exact branch coordinates are published.</p>
                        {directionsHref && (
                          <Button asChild className="mt-5">
                            <a href={directionsHref} target="_blank" rel="noreferrer"><Navigation className="h-4 w-4" /> Open directions <ExternalLink className="h-3.5 w-3.5" /></a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState className="mt-5" icon={MapPin} title="Location awaiting verification" description="No public location is available for this profile." />
                )}
              </Card>
            </div>

            <aside className="space-y-6" aria-label="Affiliate contact details">
              <Card padding="spacious">
                <Heading as="h2" variant="h4">Contact & website</Heading>
                {hasContact ? (
                  <dl className="mt-5 space-y-5 text-sm">
                    {affiliate.phone && <div><dt className="text-meta uppercase text-muted-foreground">Phone</dt><dd className="mt-1"><a href={`tel:${affiliate.phone}`} className="inline-flex items-center gap-2 font-semibold text-forest"><Phone className="h-4 w-4" />{affiliate.phone}</a></dd></div>}
                    {affiliate.email && <div><dt className="text-meta uppercase text-muted-foreground">Email</dt><dd className="mt-1 break-all"><a href={`mailto:${affiliate.email}`} className="inline-flex items-center gap-2 font-semibold text-forest"><Mail className="h-4 w-4" />{affiliate.email}</a></dd></div>}
                    {affiliate.website && <div><dt className="text-meta uppercase text-muted-foreground">Website</dt><dd className="mt-1 break-all"><a href={affiliate.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-forest"><Globe2 className="h-4 w-4" />Visit website <ExternalLink className="h-3.5 w-3.5" /></a></dd></div>}
                  </dl>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">Verified public contact and website details are not yet available.</p>
                )}
              </Card>

              <Card padding="spacious" variant="muted">
                <Heading as="h2" variant="h4">Explore the network</Heading>
                <nav aria-label="Related network content" className="mt-5 space-y-2">
                  {[
                    { href: "/network/map", label: "Network Map", icon: MapIcon },
                    { href: "/network/affiliates", label: "Affiliate Directory", icon: Network },
                    { href: "/knowledge", label: "Knowledge Centre", icon: BookOpen },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} className="flex min-h-12 items-center gap-3 rounded-control bg-surface px-4 text-sm font-semibold text-institutional shadow-sm transition-colors hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
                      <item.icon className="h-4 w-4 text-gold-strong" aria-hidden="true" />
                      <span className="flex-1">{item.label}</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ))}
                </nav>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
