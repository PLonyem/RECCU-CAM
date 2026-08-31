"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Keeps the admin shell "sticky": the back/forward buttons always land back
// on /admin (the sidebar dashboard home) instead of leaving the admin area
// or landing on a stale sub-page. (The reload case is handled earlier, by a
// blocking inline script in the layout — see RELOAD_GUARD_SCRIPT — so it
// can redirect before the sub-page even paints, which this effect, running
// only after hydration, can't do.)
export function AdminNavGuard() {
  const router = useRouter();

  useEffect(() => {
    function handlePopState() {
      if (window.location.pathname !== "/admin") {
        router.replace("/admin");
      }
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  return null;
}
