"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Menu,
  X,
  ChevronDown,
  Globe,
  LayoutDashboard,
  FileText,
  LogIn,
  LogOut,
  Home,
  Info,
  Briefcase,
  FolderOpen,
  Newspaper,
  HelpCircle,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { type TranslationKey } from "@/lib/i18n";

const navLinks: { key: TranslationKey; href: string }[] = [
  { key: "nav_home", href: "/" },
  { key: "nav_about", href: "/about" },
  { key: "nav_services", href: "/services" },
  { key: "nav_resources", href: "/resources" },
  { key: "nav_news", href: "/news" },
  { key: "nav_faq", href: "/faq" },
  { key: "nav_contact", href: "/contact" },
];

const serviceLinks: { key: TranslationKey; href: string }[] = [
  { key: "nav_services_regulatory", href: "/services/regulatory-supervision" },
  { key: "nav_services_auditing", href: "/services/financial-auditing" },
  { key: "nav_services_capacity", href: "/services/capacity-building" },
  { key: "nav_services_digitalization", href: "/services/digitalization" },
];

// Flat list for the mobile dropdown specifically — unlike the desktop nav,
// mobile doesn't nest About/Services into their own expandable sub-menus
// because there is no room for that inside a compact anchored card.
const mobileMenuLinks: { key: TranslationKey; href: string; icon: LucideIcon }[] = [
  { key: "nav_home", href: "/", icon: Home },
  { key: "nav_about", href: "/about", icon: Info },
  { key: "nav_services", href: "/services", icon: Briefcase },
  { key: "nav_resources", href: "/resources", icon: FolderOpen },
  { key: "nav_news", href: "/news", icon: Newspaper },
  { key: "nav_faq", href: "/faq", icon: HelpCircle },
  { key: "nav_contact", href: "/contact", icon: Mail },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const role = user?.publicMetadata.role;
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

  // Close the mobile menu on navigation. Adjusted during render (rather than
  // in an effect) so the menu never flashes open on the destination page.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // The mobile menu portals straight to <body> instead of rendering inside
  // this header. The homepage hero uses `isolate` (to contain its grain
  // layer's mix-blend-mode so it doesn't bleed onto content outside the
  // hero) — isolate + mix-blend-mode is a known trigger for mobile Safari
  // compositing this fixed menu *behind* that isolated stacking context
  // regardless of z-index, when the menu is nested inside a sibling of it.
  // Portaling escapes that entirely: document.body has no isolation of its
  // own, so ordinary z-index rules apply. document.body doesn't exist
  // during SSR, hence the mount guard.
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  function toggleLanguage() {
    setLanguage(language === "en" ? "fr" : "en");
  }

  function closeMobileMenu() {
    setIsOpen(false);
  }

  const isLinkActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const languageToggle = (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={t("nav_language_aria")}
      className={cn(
        "inline-flex h-10 min-w-[4.5rem] items-center justify-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 text-xs font-semibold uppercase tracking-wide text-primary-800 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-100",
        focusRing,
      )}
    >
      <Globe className="h-4 w-4" aria-hidden="true" />
      <span
        aria-hidden="true"
        className="h-4 w-px bg-primary-200"
      />
      <span>{language}</span>
    </button>
  );

  async function handleSignOut() {
    await signOut({ redirectUrl: "/" });
  }

  const signOutButton = (
    <button
      type="button"
      onClick={handleSignOut}
      title={t("nav_sign_out")}
      aria-label={t("nav_sign_out")}
      className={cn(
        "inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700",
        focusRing,
      )}
    >
      <LogOut className="h-4 w-4" />
    </button>
  );

  // Signed-in visitors (admin or credit union) get a shortcut straight
  // back to their own dashboard — this navbar is shared by every public
  // page, so it's the only place a returning credit union manager or
  // admin browsing the public site can jump back in without knowing to
  // type /login or /admin themselves. It's a shortcut, not a login
  // control: it only ever appears once a session already exists.
  const accountLink =
    !isLoaded ? null : !isSignedIn ? (
      <Link
        href="/login"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors xl:px-4",
          focusRing,
          "border-gray-300 text-gray-700 hover:bg-gray-50"
        )}
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden xl:inline">{t("nav_sign_in")}</span>
      </Link>
    ) : role === "credit_union" ? (
      <div className="flex items-center gap-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden xl:inline">{t("nav_my_dashboard")}</span>
        </Link>
        {signOutButton}
      </div>
    ) : role === "admin" ? (
      <div className="flex items-center gap-1">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium bg-primary-900 text-white hover:bg-primary-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden xl:inline">{t("nav_admin_dashboard")}</span>
        </Link>
        {signOutButton}
      </div>
    ) : (
      signOutButton
    );

  // Same role logic as accountLink above, restyled as full-width stacked
  // buttons for the mobile dropdown instead of a compact horizontal
  // cluster — accountLink itself is hidden on mobile (see its wrapper
  // below) once this is in place, so signed-in visitors still have a way
  // to sign out on mobile even though signOutButton's icon-only button
  // isn't reused here.
  const mobileAuthButtonClass =
    "flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors";
  const mobileAuthSection =
    !isLoaded ? null : !isSignedIn ? (
      <Link
        href="/login"
        onClick={closeMobileMenu}
        className={cn(mobileAuthButtonClass, "bg-primary-500 text-white hover:bg-primary-600")}
      >
        <LogIn className="h-4 w-4" />
        {t("nav_sign_in")}
      </Link>
    ) : role === "credit_union" ? (
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard"
          onClick={closeMobileMenu}
          className={cn(mobileAuthButtonClass, "bg-primary-500 text-white hover:bg-primary-600")}
        >
          <FileText className="h-4 w-4" />
          {t("nav_my_dashboard")}
        </Link>
        <button
          type="button"
          onClick={() => {
            closeMobileMenu();
            handleSignOut();
          }}
          className={cn(mobileAuthButtonClass, "border border-gray-300 text-gray-700 hover:bg-gray-50")}
        >
          <LogOut className="h-4 w-4" />
          {t("nav_sign_out")}
        </button>
      </div>
    ) : role === "admin" ? (
      <div className="flex flex-col gap-2">
        <Link
          href="/admin"
          onClick={closeMobileMenu}
          className={cn(mobileAuthButtonClass, "bg-primary-900 text-white hover:bg-primary-800")}
        >
          <LayoutDashboard className="h-4 w-4" />
          {t("nav_admin_dashboard")}
        </Link>
        <button
          type="button"
          onClick={() => {
            closeMobileMenu();
            handleSignOut();
          }}
          className={cn(mobileAuthButtonClass, "border border-gray-300 text-gray-700 hover:bg-gray-50")}
        >
          <LogOut className="h-4 w-4" />
          {t("nav_sign_out")}
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={() => {
          closeMobileMenu();
          handleSignOut();
        }}
        className={cn(mobileAuthButtonClass, "border border-gray-300 text-gray-700 hover:bg-gray-50")}
      >
        <LogOut className="h-4 w-4" />
        {t("nav_sign_out")}
      </button>
    );

  return (
    <>
    <header className="sticky top-0 z-40 h-16 border-b border-gray-200 bg-white print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 xl:gap-6">
        <Link href="/" className={cn("flex shrink-0 items-center gap-3 rounded-lg", focusRing)}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
            <Image
              src="/logo.jpg"
              alt="CamCCUL logo"
              width={74}
              height={90}
              priority
              className="h-10 w-10 object-contain"
            />
          </div>
          <div className="min-w-0">
            <span className="font-display block whitespace-nowrap text-xl font-bold leading-tight text-primary-900">
              CamCCUL
            </span>
            <span className="hidden max-w-[120px] truncate text-[10px] leading-tight text-gray-500 sm:block md:max-w-[135px] xl:max-w-none xl:text-xs">
              {t("nav_tagline")}
            </span>
          </div>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex lg:gap-2 xl:gap-4 2xl:gap-8">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href);

            if (link.key === "nav_services") {
              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onMouseLeave={() => setIsServicesOpen(false)}
                  onFocus={() => setIsServicesOpen(true)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setIsServicesOpen(false);
                    }
                  }}
                >
                  <span
                    className={cn(
                      "flex cursor-default items-center gap-1 whitespace-nowrap py-2 text-[10px] font-medium text-gray-600 transition-colors hover:text-primary-600 lg:text-xs xl:text-[15px]",
                      isActive && "font-semibold text-primary-600"
                    )}
                  >
                    {t(link.key)}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </span>

                  <div
                    className={cn(
                      "absolute left-0 top-full w-64 rounded-lg border border-primary-100 bg-white shadow-lg py-2 transition-opacity duration-150",
                      isServicesOpen
                        ? "opacity-100 visible"
                        : "opacity-0 invisible pointer-events-none"
                    )}
                  >
                    {serviceLinks.map((service) => (
                      <Link
                        key={service.href}
                        href={service.href}
                        onClick={() => setIsServicesOpen(false)}
                        className="block px-4 py-2.5 text-sm text-primary-700 hover:bg-primary-50 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      >
                        {t(service.key)}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded text-[10px] font-medium text-gray-600 transition-colors hover:text-primary-600 lg:text-xs xl:text-[15px]",
                  focusRing,
                  isActive && "font-semibold text-primary-600"
                )}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="hidden md:block">{languageToggle}</div>
          <div className="hidden md:block">{accountLink}</div>

          <button
            type="button"
            className={cn(
              "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 transition-colors md:hidden",
              focusRing,
              "text-primary-700 hover:bg-primary-50"
            )}
            aria-label={isOpen ? t("nav_menu_close_aria") : t("nav_menu_open_aria")}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </header>

    {/*
      Portaled straight to <body>, not rendered inside the header. The
      homepage hero uses `isolate` (to contain its grain layer's
      mix-blend-mode so it doesn't bleed onto content outside the hero) —
      isolate + mix-blend-mode is a known trigger for mobile Safari
      compositing a sibling's fixed-position content *behind* that isolated
      stacking context regardless of z-index. Portaling to body sidesteps it
      entirely: body has no isolation of its own, so ordinary z-index rules
      apply against every ancestor's content, hero included.

      `fixed` (viewport-relative), not `absolute` (relative to the nearest
      positioned ancestor — normally the header, which is `sticky`). In
      principle a stuck sticky header never leaves the viewport's top edge
      so `absolute top-full` should track it, but any ancestor further up
      the tree with a `transform`/`filter`/`contain` creates its own
      containing block and silently breaks that stickiness — the header
      (and an absolutely-positioned menu riding on it) then scrolls away
      with the page instead of staying put. `fixed` sidesteps that question
      too by anchoring to the viewport directly. `top-16 right-4` puts it
      right where `absolute top-full right-0` on the button itself would
      have landed, so it still reads as "springing from the icon" without
      inheriting the button's own containing-block/stacking problems.
    */}
    {isMounted && createPortal(
      <>
        <div
          aria-hidden="true"
          onClick={closeMobileMenu}
          className={cn(
            "fixed inset-0 z-40 bg-black/20 md:hidden",
            "transition-opacity duration-300 ease-in-out",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        />
        <div
          aria-hidden={!isOpen}
          className={cn(
            "fixed right-4 top-16 z-50 w-72 min-w-64 max-w-[calc(100vw-2rem)] md:hidden",
            "max-h-[calc(100dvh-5rem)] flex flex-col bg-white",
            "rounded-xl border border-gray-200 shadow-xl overflow-hidden overflow-y-auto",
            "origin-top-right",
            isOpen ? "pointer-events-auto" : "pointer-events-none"
          )}
          style={{
            animation: isOpen
              ? "springIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
              : "springOut 0.15s ease-in forwards",
          }}
        >
        {/* No separate close button here — the hamburger button itself
            (still visible in the navbar above) already toggles to an X
            while this is open, so a second close control right below it
            would be redundant in a compact card like this. */}
        <nav className="flex flex-col py-2">
          {mobileMenuLinks.map((link) => {
            const isActive = isLinkActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={cn(
                  "px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 flex items-center gap-3 transition-colors",
                  isActive && "text-primary-600 font-semibold bg-primary-50/60"
                )}
              >
                <Icon className="h-4 w-4 text-gray-400" />
                {t(link.key)}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 my-2" />

        <div className="px-4 pb-3">{languageToggle}</div>

        <div className="px-4 pb-4">{mobileAuthSection}</div>
        </div>
      </>,
      document.body
    )}
    </>
  );
}
