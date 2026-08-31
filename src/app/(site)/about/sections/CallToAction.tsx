"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { FadeUp } from "@/components/ui/FadeUp";

// SECTION 8 — Call to action. The only solid-blue band on the page — the
// page's single point of emphasis. Heading/button text reuses the exact
// phrase already used for this same action elsewhere on the site (Navbar,
// homepage CTA) rather than inventing new copy.
export function CallToAction() {
  const { t } = useLanguage();

  return (
    <section className="bg-primary-500 py-16 md:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-4 text-center">
        <FadeUp>
          <h2 className="text-[28px] md:text-[40px] font-display font-bold text-white">
            {t("nav_find_credit_union")}
          </h2>
          <Link
            href="/affiliates"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "mt-8 bg-white text-primary-700 hover:bg-primary-50"
            )}
          >
            {t("nav_find_credit_union")}
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}
