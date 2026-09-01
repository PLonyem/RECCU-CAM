"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Globe2, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";
import { Container } from "@/components/ui/Container";
import { PortalActions } from "@/components/layout/PortalActions";
import { useLanguage } from "@/context/LanguageContext";
import { publicCopy } from "@/data/public-copy";
import { cn } from "@/lib/utils";

const links = [
  { key: "about", href: "/about" },
  { key: "network", href: "/network/affiliates" },
  { key: "banking", href: "/services/affiliate-banking" },
  { key: "vtime", href: "/vtime" },
  { key: "knowledge", href: "/knowledge" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const copy = publicCopy[language].nav;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-primary-100 bg-white/95 backdrop-blur print:hidden">
      <Container className="flex h-20 items-center justify-between gap-5">
        <Link href="/" className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
          <BrandMark />
          <span className="min-w-0">
            <span className="block font-display text-lg font-bold leading-none text-primary-900">RECCU-CAM</span>
            <span className="mt-1 hidden truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500 sm:block">
              Cooperative network platform
            </span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                  active ? "bg-primary-50 text-primary-800" : "text-gray-600 hover:bg-gray-50 hover:text-primary-800",
                )}
              >
                {copy[link.key]}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "fr" : "en")}
            aria-label="Change language"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-xs font-bold uppercase text-gray-600 hover:border-primary-200 hover:text-primary-800"
          >
            <Globe2 className="h-4 w-4" /> {language}
          </button>
          <PortalActions signInLabel={copy.signIn} />
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="grid h-11 w-11 place-items-center rounded-xl border border-gray-200 text-primary-900 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {open && (
        <div id="mobile-navigation" className="border-t border-gray-100 bg-white lg:hidden">
          <Container className="space-y-1 py-5">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-800">
                {copy[link.key]} <ChevronRight className="h-4 w-4" />
              </Link>
            ))}
            <Link href="/network/map" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-800">
              Network map <ChevronRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-800">
              {copy.contact} <ChevronRight className="h-4 w-4" />
            </Link>
            <div className="mt-3 flex gap-2 border-t border-gray-100 pt-4">
              <button type="button" onClick={() => setLanguage(language === "en" ? "fr" : "en")} className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-bold uppercase text-gray-600">
                <Globe2 className="h-4 w-4" /> {language}
              </button>
              <PortalActions mobile signInLabel={copy.signIn} onNavigate={() => setOpen(false)} />
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
