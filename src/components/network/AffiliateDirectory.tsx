"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, MapPin, Search } from "lucide-react";
import type { NetworkAffiliate } from "@/data/affiliates";

export function AffiliateDirectory({ affiliates }: { affiliates: NetworkAffiliate[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return affiliates;
    return affiliates.filter((affiliate) =>
      [affiliate.name, affiliate.shortName, affiliate.city, affiliate.region]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [affiliates, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-3xl border border-primary-100 bg-primary-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block flex-1">
          <span className="sr-only">Search affiliates</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by institution, code, city, or region" className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100" />
        </label>
        <p aria-live="polite" className="text-sm font-semibold text-primary-800">{filtered.length} source-listed {filtered.length === 1 ? "entry" : "entries"}</p>
      </div>

      {filtered.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((affiliate) => (
            <article key={affiliate.code} className="flex flex-col rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-primary-200 hover:shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-700"><Building2 className="h-6 w-6" /></span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">{affiliate.shortName}</span>
              </div>
              <h2 className="mt-6 font-display text-xl font-bold leading-7 text-primary-900">{affiliate.name}</h2>
              <p className="mt-4 flex items-center gap-2 text-sm text-gray-600"><MapPin className="h-4 w-4 text-accent-600" /> {affiliate.city}, {affiliate.region}</p>
              <Link href={`/network/affiliates/${affiliate.code.toLowerCase()}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-700">View source-labelled profile <ArrowRight className="h-4 w-4" /></Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-gray-300 p-12 text-center"><h2 className="font-display text-xl font-bold text-primary-900">No matching entry</h2><p className="mt-2 text-gray-600">Try a different institution name, code, or place.</p></div>
      )}
    </div>
  );
}
