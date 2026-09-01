"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FadeUp } from "@/components/ui/FadeUp";
import { Container } from "@/components/ui/Container";

interface Breadcrumb {
  label: string;
  href: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumb?: Breadcrumb[];
}

// Used at the top of nearly every non-home page (services, contact, faq,
// resources, news, affiliates) — fading it here gives those pages the same
// scroll-reveal entrance as the homepage/About without editing each one.
export function PageHero({ title, subtitle, breadcrumb }: PageHeroProps) {
  return (
    <section className="bg-institutional py-section-sm text-white md:py-section">
      <Container>
        <FadeUp>
          {breadcrumb && breadcrumb.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-meta text-primary-200">
              {breadcrumb.map((item, index) => {
                const isLast = index === breadcrumb.length - 1;
                return (
                  <span key={item.href} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="h-4 w-4" />}
                    {isLast ? (
                      <span aria-current="page" className="text-white">{item.label}</span>
                    ) : (
                      <Link href={item.href} className="rounded-sm transition-colors duration-fast hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-institutional">
                        {item.label}
                      </Link>
                    )}
                  </span>
                );
              })}
            </nav>
          )}

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
