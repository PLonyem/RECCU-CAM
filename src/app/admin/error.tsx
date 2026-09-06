"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CircleAlert, LayoutDashboard, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[admin] route failed", { digest: error.digest });
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6" role="alert">
      <section className="w-full max-w-2xl rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-50 text-amber-700">
          <CircleAlert className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-institutional">Unable to load this section.</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
          We couldn&apos;t load this section right now. Your session remains secure and no changes were made.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => unstable_retry()} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary-800 px-5 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Retry
          </button>
          <Link href="/admin" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-institutional hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Back to Admin Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
