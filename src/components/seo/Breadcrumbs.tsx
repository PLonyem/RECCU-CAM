"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  createBreadcrumbStructuredData,
  type BreadcrumbItem,
} from "@/lib/structured-data";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
  inverted?: boolean;
  className?: string;
}

export function Breadcrumbs({ items, inverted = false, className }: BreadcrumbsProps) {
  const { tText } = useLanguage();
  if (items.length === 0) return null;

  return (
    <>
      <JsonLd data={createBreadcrumbStructuredData(items)} />
      <nav
        aria-label={tText("Breadcrumb")}
        className={cn(
          "mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta",
          inverted ? "text-primary-200" : "text-muted-foreground",
          className
        )}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={`${item.href}-${item.label}`} className="flex items-center gap-2">
              {index > 0 && <ChevronRight aria-hidden="true" className="h-4 w-4" />}
              {isLast ? (
                <span aria-current="page" className={inverted ? "text-white" : "text-foreground"}>
                  {tText(item.label)}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-sm transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
                    inverted
                      ? "hover:text-white focus-visible:ring-offset-institutional"
                      : "hover:text-institutional focus-visible:ring-offset-background"
                  )}
                >
                  {tText(item.label)}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
