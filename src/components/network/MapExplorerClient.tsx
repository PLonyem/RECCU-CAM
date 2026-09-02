"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowRight,
  ExternalLink,
  ListFilter,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  deriveAffiliateFilterOptions,
  filterAffiliates,
  getMappableAffiliates,
  type AffiliateFilterOptions,
  type FilterOption,
  type MappableAffiliate,
} from "@/data/affiliates/helpers";
import { getRegionById } from "@/data/affiliates/regions";
import type { Affiliate } from "@/data/affiliates/types";

const InteractiveNetworkMap = dynamic(() => import("./InteractiveNetworkMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[32rem] place-items-center bg-primary-50 p-8 lg:h-[45rem]">
      <div className="w-full max-w-xs text-center">
        <MapPin className="mx-auto h-8 w-8 text-forest" aria-hidden="true" />
        <p className="mt-4 font-semibold text-institutional">Loading interactive map…</p>
        <LoadingSkeleton className="mt-5" lines={3} />
      </div>
    </div>
  ),
});

interface MapExplorerClientProps {
  affiliates: readonly Affiliate[];
}

interface MapFiltersProps {
  idPrefix: string;
  filterOptions: AffiliateFilterOptions;
  values: { query: string; region: string; city: string; service: string };
  onChange: (key: "query" | "region" | "city" | "service", value: string) => void;
  onReset: () => void;
  resultCount: number;
}

function filterPlaceholder(label: string) {
  if (label === "City") return "All cities";
  return `All ${label.toLowerCase()}s`;
}

function MapFilterSelect({
  id,
  label,
  onChange,
  options,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  options: readonly FilterOption[];
  value: string;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-meta uppercase text-institutional">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={options.length === 0}
        className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-fast focus:border-forest focus:ring-2 focus:ring-forest/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
      >
        <option value="">{options.length > 0 ? filterPlaceholder(label) : "No mapped options"}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function MapFilters({ idPrefix, filterOptions, onChange, onReset, resultCount, values }: MapFiltersProps) {
  const hasFilters = Boolean(values.query || values.region || values.city || values.service);
  const searchId = `${idPrefix}-map-search`;

  return (
    <div>
      <label htmlFor={searchId} className="block">
        <span className="text-meta uppercase text-institutional">Search mapped affiliates</span>
        <span className="relative mt-2 block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id={searchId}
            type="search"
            value={values.query}
            onChange={(event) => onChange("query", event.target.value)}
            placeholder="Search by institution or place"
            className="min-h-11 w-full rounded-control border border-border bg-surface pl-10 pr-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-fast placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20"
          />
        </span>
      </label>
      <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
        <MapFilterSelect id={`${idPrefix}-map-region`} label="Region" options={filterOptions.regions} value={values.region} onChange={(value) => onChange("region", value)} />
        <MapFilterSelect id={`${idPrefix}-map-city`} label="City" options={filterOptions.cities} value={values.city} onChange={(value) => onChange("city", value)} />
        <MapFilterSelect id={`${idPrefix}-map-service`} label="Service" options={filterOptions.services} value={values.service} onChange={(value) => onChange("service", value)} />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p aria-live="polite" className="text-sm font-semibold text-institutional">{resultCount} mapped {resultCount === 1 ? "affiliate" : "affiliates"}</p>
        <Button variant="ghost" size="sm" onClick={onReset} disabled={!hasFilters}>Reset filters</Button>
      </div>
    </div>
  );
}

function directionsHref(affiliate: MappableAffiliate) {
  return `https://www.google.com/maps/dir/?api=1&destination=${affiliate.latitude},${affiliate.longitude}`;
}

function MapResults({
  affiliates,
  onSelect,
  selectedSlug,
}: {
  affiliates: readonly MappableAffiliate[];
  onSelect: (slug: string) => void;
  selectedSlug: string | null;
}) {
  if (affiliates.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No verified map locations"
        description="No affiliates matching these filters have complete coordinates in the structured data source."
      />
    );
  }

  return (
    <ol className="space-y-3" aria-label="Mapped affiliate results">
      {affiliates.map((affiliate) => {
        const region = getRegionById(affiliate.region)?.name;
        const location = [affiliate.city, region].filter(Boolean).join(", ");
        const selected = affiliate.slug === selectedSlug;

        return (
          <li key={affiliate.id}>
            <article className={`rounded-card border p-4 transition-colors ${selected ? "border-primary-300 bg-primary-50" : "border-border bg-surface"}`}>
              <button
                type="button"
                onClick={() => onSelect(affiliate.slug)}
                aria-pressed={selected}
                className="w-full rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
              >
                <span className="text-meta uppercase text-forest">{affiliate.acronym}</span>
                <span className="mt-1 block font-display text-base font-bold leading-snug text-institutional">{affiliate.name}</span>
                {location && <span className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0 text-gold-strong" />{location}</span>}
                {affiliate.shortDescription && <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{affiliate.shortDescription}</span>}
              </button>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3 text-sm font-semibold">
                <Link href={`/network/affiliates/${affiliate.slug}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-sm text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">View Profile <ArrowRight className="h-4 w-4" /></Link>
                <a href={directionsHref(affiliate)} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-sm text-muted-foreground hover:text-institutional focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"><Navigation className="h-4 w-4" /> Directions <ExternalLink className="h-3.5 w-3.5" /></a>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}

export function MapExplorerClient({ affiliates }: MapExplorerClientProps) {
  const mappableAffiliates = useMemo(() => getMappableAffiliates(affiliates), [affiliates]);
  const filterOptions = useMemo(() => deriveAffiliateFilterOptions(mappableAffiliates), [mappableAffiliates]);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [service, setService] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [resultsOpen, setResultsOpen] = useState(false);

  const filtered = useMemo(() => filterAffiliates(mappableAffiliates, {
    query,
    region,
    city,
    service,
  }), [city, mappableAffiliates, query, region, service]);
  const activeSelectedSlug = filtered.some((affiliate) => affiliate.slug === selectedSlug)
    ? selectedSlug
    : null;
  const omittedCount = affiliates.length - mappableAffiliates.length;

  const selectAffiliate = useCallback((slug: string) => {
    setSelectedSlug(slug);
  }, []);

  function changeFilter(key: "query" | "region" | "city" | "service", value: string) {
    if (key === "query") setQuery(value);
    if (key === "region") setRegion(value);
    if (key === "city") setCity(value);
    if (key === "service") setService(value);
  }

  function resetFilters() {
    setQuery("");
    setRegion("");
    setCity("");
    setService("");
  }

  const values = { query, region, city, service };

  if (mappableAffiliates.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="Verified coordinates are not currently published"
        description="The map will display institutions only after coordinates are confirmed. Use the affiliate directory for source-listed names and towns."
        action={
          <Button asChild variant="secondary">
            <Link href="/network/affiliates">Browse Affiliate Directory <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-panel border border-border bg-surface shadow-card lg:grid lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="hidden max-h-[45rem] flex-col border-r border-border bg-muted/50 lg:flex" aria-label="Map filters and accessible results">
          <div className="border-b border-border p-5">
            <MapFilters idPrefix="desktop" filterOptions={filterOptions} values={values} onChange={changeFilter} onReset={resetFilters} resultCount={filtered.length} />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <MapResults affiliates={filtered} selectedSlug={activeSelectedSlug} onSelect={selectAffiliate} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="border-b border-border bg-muted/50 p-4 lg:hidden">
            <MapFilters idPrefix="mobile" filterOptions={filterOptions} values={values} onChange={changeFilter} onReset={resetFilters} resultCount={filtered.length} />
          </div>
          <InteractiveNetworkMap affiliates={filtered} selectedSlug={activeSelectedSlug} onSelect={selectAffiliate} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {omittedCount > 0
            ? `${omittedCount} source-listed ${omittedCount === 1 ? "record is" : "records are"} omitted because verified coordinates are not available.`
            : "All source-listed records with coordinates are represented on the map."}
        </p>

        <Dialog.Root open={resultsOpen} onOpenChange={setResultsOpen}>
          <Dialog.Trigger asChild>
            <Button variant="secondary" className="shrink-0 lg:hidden"><ListFilter className="h-4 w-4" /> View map results ({filtered.length})</Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[70] bg-institutional/60 backdrop-blur-sm" />
            <Dialog.Content className="fixed inset-x-0 bottom-0 z-[80] max-h-[82dvh] overflow-y-auto rounded-t-panel bg-surface p-5 shadow-raised focus:outline-none">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <Dialog.Title className="font-display text-h3 text-institutional">Mapped affiliates</Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-muted-foreground">An accessible list of the markers currently shown on the map.</Dialog.Description>
                </div>
                <Dialog.Close asChild><Button variant="ghost" size="icon" aria-label="Close map results"><X className="h-5 w-5" /></Button></Dialog.Close>
              </div>
              <div className="mt-5">
                <MapResults
                  affiliates={filtered}
                  selectedSlug={activeSelectedSlug}
                  onSelect={(slug) => {
                    selectAffiliate(slug);
                    setResultsOpen(false);
                  }}
                />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
