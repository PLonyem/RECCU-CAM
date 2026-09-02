"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu, Search, X } from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { siteNavigation, type NavigationLink } from "@/data/site-navigation";
import { cn } from "@/lib/utils";

const DESKTOP_HOVER_QUERY = "(any-hover: hover) and (any-pointer: fine)";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isSectionActive(pathname: string, item: NavigationLink) {
  return isActivePath(pathname, item.href)
    || item.children?.some((child) => isActivePath(pathname, child.href))
    || false;
}

function getOverviewLabel(item: NavigationLink, fallback: string) {
  if (item.label === "Our Network") return "Network Overview";
  if (item.label === "Services") return "Services overview";
  return fallback;
}

function canUseDesktopHover(event: ReactPointerEvent<HTMLElement>) {
  return event.pointerType === "mouse" && window.matchMedia(DESKTOP_HOVER_QUERY).matches;
}

function DesktopNavigationItem({
  item,
  openMenu,
  pathname,
  setOpenMenu,
}: {
  item: NavigationLink;
  openMenu: string | null;
  pathname: string;
  setOpenMenu: Dispatch<SetStateAction<string | null>>;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointerType = useRef<string | null>(null);
  const active = isSectionActive(pathname, item);
  const isOpen = openMenu === item.label;
  const menuId = `desktop-menu-${item.label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setOpenMenu((currentMenu) => currentMenu === item.label ? null : currentMenu);
      closeTimer.current = null;
    }, 140);
  };
  const openFromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canUseDesktopHover(event)) return;
    cancelClose();
    setOpenMenu(item.label);
  };
  const closeFromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canUseDesktopHover(event)) return;
    scheduleClose();
  };

  useEffect(() => () => cancelClose(), []);

  if (!item.children) {
    return (
      <Link
        href={item.href}
        onClick={() => setOpenMenu(null)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative inline-flex min-h-12 items-center whitespace-nowrap px-3 text-sm font-semibold transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-inset",
          active ? "text-institutional after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-gold" : "text-muted-foreground hover:text-institutional",
        )}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onPointerEnter={openFromPointer}
      onPointerLeave={closeFromPointer}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setOpenMenu((currentMenu) => currentMenu === item.label ? null : currentMenu);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={menuId}
        onPointerDown={(event) => {
          lastPointerType.current = event.pointerType;
        }}
        onClick={(event) => {
          const finePointerClick = event.detail > 0
            && lastPointerType.current === "mouse"
            && window.matchMedia(DESKTOP_HOVER_QUERY).matches;
          lastPointerType.current = null;
          if (finePointerClick) {
            setOpenMenu(item.label);
            return;
          }
          setOpenMenu(isOpen ? null : item.label);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpenMenu(item.label);
            requestAnimationFrame(() => firstLinkRef.current?.focus());
          }
          if (event.key === "Escape") setOpenMenu(null);
        }}
        className={cn(
          "relative inline-flex min-h-12 items-center gap-1 whitespace-nowrap px-3 text-sm font-semibold transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-inset",
          active ? "text-institutional after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-gold" : "text-muted-foreground hover:text-institutional",
        )}
      >
        {item.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-base", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div
          id={menuId}
          className={cn(
            "absolute top-full z-[60] w-[23rem] animate-fade-in rounded-b-panel border border-border bg-surface p-3 shadow-raised motion-reduce:animate-none",
            item.align === "right" ? "right-0" : "left-0",
          )}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setOpenMenu(null);
              buttonRef.current?.focus();
            }
          }}
        >
          <div className="border-b border-border px-3 pb-3 pt-1">
            <p className="font-display text-sm font-bold text-institutional">{item.label}</p>
            <Link href={item.href} onClick={() => setOpenMenu(null)} className="mt-1 inline-flex text-xs font-semibold text-gold-strong hover:text-institutional">
              {getOverviewLabel(item, "View section overview")}
            </Link>
          </div>
          <ul className="mt-2 grid gap-1">
            {item.children.map((child, index) => {
              const childActive = child.href === item.href
                ? pathname === child.href
                : isActivePath(pathname, child.href);
              return (
                <li key={`${child.href}-${child.label}`}>
                  <Link
                    ref={index === 0 ? firstLinkRef : undefined}
                    href={child.href}
                    onClick={() => setOpenMenu(null)}
                    aria-current={childActive ? "page" : undefined}
                    className={cn(
                      "group block rounded-control px-3 py-2.5 transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest",
                      childActive ? "bg-primary-50" : "hover:bg-muted",
                    )}
                  >
                    <span className="flex items-center justify-between gap-3 text-sm font-semibold text-institutional">
                      {child.label}
                      <ChevronRight className="h-3.5 w-3.5 text-gold-strong transition-transform duration-fast group-hover:translate-x-0.5" />
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{child.description}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const mobileNavigationRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  useEffect(() => {
    const closeNavigation = () => {
      setOpenMenu(null);
      setMobileOpen(false);
      setMobileSection(null);
    };
    window.addEventListener("popstate", closeNavigation);
    return () => window.removeEventListener("popstate", closeNavigation);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => firstMobileLinkRef.current?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        mobileButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !mobileNavigationRef.current) return;
      const focusable = Array.from(
        mobileNavigationRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ).filter((element) => element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-border bg-surface/95 shadow-sm backdrop-blur-md print:hidden">
      <Container className="flex h-[4.5rem] items-center justify-between gap-4 xl:h-20">
        <Link href="/" onClick={() => { setOpenMenu(null); setMobileOpen(false); }} className="flex min-w-0 items-center gap-3 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-4">
          <BrandMark />
          <span className="min-w-0">
            <span className="block font-display text-lg font-bold leading-none text-institutional">RECCU-CAM</span>
            <span className="mt-1 hidden truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:block">
              Cooperative network platform
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 xl:flex">
          <Link href="/affiliate-portal" prefetch={false} onClick={() => setOpenMenu(null)} className={buttonVariants({ variant: "secondary", size: "sm" })}>
            Affiliate Portal
          </Link>
          <Link href="/network/affiliates" onClick={() => setOpenMenu(null)} className={buttonVariants({ variant: "default", size: "sm" })}>
            <Search className="h-4 w-4" /> Find a Credit Union
          </Link>
        </div>

        <button
          ref={mobileButtonRef}
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-control border border-border text-institutional transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest xl:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      <div className="hidden overflow-visible border-t border-border xl:block">
        <Container className="overflow-visible">
          <nav aria-label="Primary navigation" className="flex min-w-0 items-center justify-between overflow-visible">
            {siteNavigation.map((item) => (
              <DesktopNavigationItem
                key={item.label}
                item={item}
                openMenu={openMenu}
                pathname={pathname}
                setOpenMenu={setOpenMenu}
              />
            ))}
          </nav>
        </Container>
      </div>

      {mobileOpen && (
        <div
          ref={mobileNavigationRef}
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="absolute inset-x-0 top-full h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-border bg-surface xl:hidden"
        >
          <Container className="py-5">
            <nav aria-label="Mobile navigation">
              <ul className="space-y-1">
                {siteNavigation.map((item, itemIndex) => {
                  const active = isSectionActive(pathname, item);
                  const expanded = mobileSection === item.label;
                  if (!item.children) {
                    return (
                      <li key={item.label}>
                        <Link
                          ref={itemIndex === 0 ? firstMobileLinkRef : undefined}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-12 items-center justify-between rounded-control px-4 py-3 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest",
                            active ? "bg-primary-50 text-institutional" : "text-foreground hover:bg-muted",
                          )}
                        >
                          {item.label}<ChevronRight className="h-4 w-4 text-gold-strong" />
                        </Link>
                      </li>
                    );
                  }
                  const sectionId = `mobile-section-${item.label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;
                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={sectionId}
                        onClick={() => setMobileSection(expanded ? null : item.label)}
                        className={cn(
                          "flex min-h-12 w-full items-center justify-between rounded-control px-4 py-3 text-left font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest",
                          active ? "bg-primary-50 text-institutional" : "text-foreground hover:bg-muted",
                        )}
                      >
                        {item.label}<ChevronDown className={cn("h-4 w-4 text-gold-strong transition-transform duration-base", expanded && "rotate-180")} />
                      </button>
                      {expanded && (
                        <div id={sectionId} className="ml-4 border-l border-primary-200 py-2 pl-3">
                          <Link href={item.href} onClick={() => setMobileOpen(false)} className="block rounded-control px-3 py-2 text-sm font-bold text-gold-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest">
                            {getOverviewLabel(item, "Section overview")}
                          </Link>
                          {item.children.map((child) => (
                            <Link
                              key={`${child.href}-${child.label}`}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              aria-current={isActivePath(pathname, child.href) ? "page" : undefined}
                              className="block rounded-control px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-institutional focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
              <Link href="/network/affiliates" onClick={() => setMobileOpen(false)} className={buttonVariants({ variant: "default" })}>
                <Search className="h-4 w-4" /> Find a Credit Union
              </Link>
              <Link href="/affiliate-portal" prefetch={false} onClick={() => setMobileOpen(false)} className={buttonVariants({ variant: "secondary" })}>
                Affiliate Portal
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
