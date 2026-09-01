"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { NetworkAffiliate } from "@/data/affiliates";

export default function NetworkMapCanvas({ affiliates }: { affiliates: NetworkAffiliate[] }) {
  const [selectedCode, setSelectedCode] = useState(affiliates[0]?.code ?? "");
  const selected = affiliates.find((affiliate) => affiliate.code === selectedCode) ?? affiliates[0];
  return (
    <div className="grid overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm lg:grid-cols-[1.45fr_.55fr]">
      <div className="relative min-h-[560px] overflow-hidden bg-[#EAF4EE] p-6">
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#ADD7C0_1px,transparent_1px),linear-gradient(90deg,#ADD7C0_1px,transparent_1px)] [background-size:40px_40px]" />
        <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-8 h-[calc(100%-4rem)] w-[calc(100%-4rem)] text-primary-100 drop-shadow-sm"><path fill="currentColor" stroke="#7CBA99" strokeWidth="1" d="M45 3 61 9 67 22 63 35 72 48 68 64 58 77 54 94 41 97 34 82 24 70 29 53 20 41 28 27 31 12Z" /></svg>
        <div className="absolute left-6 top-6 rounded-xl bg-white/90 px-4 py-3 shadow-sm backdrop-blur"><p className="text-xs font-bold uppercase tracking-wider text-primary-700">Illustrative network view</p><p className="mt-1 text-xs text-gray-500">Points indicate source-listed towns, not branch coordinates.</p></div>
        {affiliates.map((affiliate) => (
          <button key={affiliate.code} type="button" onClick={() => setSelectedCode(affiliate.code)} aria-label={`Select ${affiliate.name}`} style={{ left: `${affiliate.mapPosition.x}%`, top: `${affiliate.mapPosition.y}%` }} className="group absolute z-10 -translate-x-1/2 -translate-y-1/2">
            <span className={`grid h-9 w-9 place-items-center rounded-full border-4 border-white shadow-lg transition ${selectedCode === affiliate.code ? "scale-125 bg-accent-500 text-primary-900" : "bg-primary-700 text-white hover:scale-110"}`}><MapPin className="h-4 w-4" /></span>
            <span className="pointer-events-none absolute left-1/2 top-11 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-primary-900 px-2 py-1 text-[10px] font-bold text-white group-hover:block">{affiliate.shortName}</span>
          </button>
        ))}
      </div>
      <aside className="border-t border-primary-100 p-6 lg:border-l lg:border-t-0">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-700">Selected institution</p>
        {selected && <><h2 className="mt-4 font-display text-2xl font-bold text-primary-900">{selected.shortName}</h2><p className="mt-2 text-sm leading-6 text-gray-600">{selected.name}</p><p className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary-700"><MapPin className="h-4 w-4" /> {selected.city}</p><Link href={`/network/affiliates/${selected.code.toLowerCase()}`} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary-700">Open profile <ArrowRight className="h-4 w-4" /></Link></>}
        <div className="mt-8 border-t border-gray-100 pt-6"><p className="text-xs leading-5 text-gray-500">This map is loaded only on this page and uses no third-party map tracker or API key.</p></div>
      </aside>
    </div>
  );
}
