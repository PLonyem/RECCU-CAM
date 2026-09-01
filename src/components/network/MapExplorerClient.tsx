"use client";

import dynamic from "next/dynamic";
import type { NetworkAffiliate } from "@/data/affiliates";

const NetworkMapCanvas = dynamic(() => import("./NetworkMapCanvas"), {
  ssr: false,
  loading: () => <div className="grid min-h-[520px] place-items-center rounded-3xl border border-primary-100 bg-primary-50"><p className="font-semibold text-primary-700">Loading the network map…</p></div>,
});

export function MapExplorerClient({ affiliates }: { affiliates: NetworkAffiliate[] }) {
  return <NetworkMapCanvas affiliates={affiliates} />;
}
