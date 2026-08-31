"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FadeUp } from "@/components/ui/FadeUp";

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
    <section className="bg-primary-900 text-white py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <FadeUp>
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              {breadcrumb.map((item, index) => {
                const isLast = index === breadcrumb.length - 1;
                return (
                  <span key={item.href} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="h-4 w-4" />}
                    {isLast ? (
                      <span className="text-white">{item.label}</span>
                    ) : (
                      <Link href={item.href} className="hover:text-white transition-colors">
                        {item.label}
                      </Link>
                    )}
                  </span>
                );
              })}
            </div>
          )}

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
            {title}
          </h1>

          {subtitle && (
            <p className="text-lg text-gray-300 mt-4 max-w-2xl">{subtitle}</p>
          )}
        </FadeUp>
      </div>
    </section>
  );
}
