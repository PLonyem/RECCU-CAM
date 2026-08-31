"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

// Sends the user back to the homepage whenever the browser's own reload
// (F5 / Ctrl+R / the reload button — not a link click or back/forward) loads
// a page other than "/". Detected via the Navigation Timing API, since
// there's no way to intercept the native reload action itself — the check
// only runs once per real page load (guarded by the ref), so client-side
// navigation afterward is left alone.
export function ReloadRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    if (pathname === "/") return;

    const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (entry?.type === "reload") {
      router.replace("/");
    }
  }, [pathname, router]);

  return null;
}
