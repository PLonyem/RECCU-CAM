import { FadeUp } from "@/components/ui/FadeUp";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import type { BreadcrumbItem } from "@/lib/structured-data";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
}

// Used at the top of nearly every non-home page (services, contact, faq,
// resources, news, affiliates) — fading it here gives those pages the same
// scroll-reveal entrance as the homepage/About without editing each one.
export function PageHero({ title, subtitle, breadcrumb }: PageHeroProps) {
  return (
    <section className="bg-institutional py-section-sm text-white md:py-section">
      <Container>
        <FadeUp>
          {breadcrumb && <Breadcrumbs items={breadcrumb} inverted />}

          <h1 className="font-display text-h1 text-white">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-4 max-w-reading text-lead text-primary-100">{subtitle}</p>
          )}
        </FadeUp>
      </Container>
    </section>
  );
}
