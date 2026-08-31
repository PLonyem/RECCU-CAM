"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FadeUpProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger index within a group — multiplied by staggerMs. */
  index?: number;
  /** Delay per stagger step, ms. Default matches the site-wide 60ms. */
  staggerMs?: number;
  /** Landing-page polish pass's refined section timing (500ms, custom
   * easing) via the additive .fade-up-refined class in globals.css —
   * homepage only, every other consumer is unaffected. */
  refined?: boolean;
  /** Landing-page polish pass's hero-content timing (20px, 600ms, custom
   * easing) via the additive .fade-up-hero class in globals.css — the
   * homepage hero only. */
  hero?: boolean;
}

// Shared scroll-reveal wrapper used site-wide — fades up 16px over 400ms,
// once, respecting prefers-reduced-motion via the .fade-up rules in
// globals.css. Originally built for the About page, promoted here so every
// page can use the same effect instead of each having its own copy. The
// `refined`/`hero` variants layer additional, purely additive CSS classes
// on top for the landing-page polish pass without changing this default.
export function FadeUp({
  children,
  className,
  index = 0,
  staggerMs = 60,
  refined = false,
  hero = false,
}: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "fade-up",
        refined && "fade-up-refined",
        hero && "fade-up-hero",
        isVisible && "is-visible",
        className
      )}
      style={{ transitionDelay: `${index * staggerMs}ms` }}
    >
      {children}
    </div>
  );
}
