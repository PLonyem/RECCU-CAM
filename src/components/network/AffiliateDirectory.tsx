"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Grid2X2,
  List,
  Map,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { AffiliateCard, getInstitutionTypeLabel } from "@/components/network/AffiliateCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  filterAffiliates,
  type AffiliateFilterOptions,
  type FilterOption,
} from "@/data/affiliates/helpers";
import type { Affiliate, InstitutionType } from "@/data/affiliates/types";
import { cn } from "@/lib/utils";

type FilterKey = "region" | "city" | "type" | "service";

interface AffiliateDirectoryProps {
  affiliates: readonly Affiliate[];
  filterOptions: AffiliateFilterOptions;
}

interface FilterSelectProps {
  id: string;
  label: string;
  options: readonly FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

function FilterSelect({ id, label, onChange, options, value }: FilterSelectProps) {
  const allOptionsLabel = label === "City"
    ? "All cities"
    : label === "Institution Type"
      ? "All institution types"
      : `All ${label.toLowerCase()}s`;

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
        <option value="">{options.length === 0 ? "No verified options" : allOptionsLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function FilterFields({
  filterOptions,
  onFilterChange,
  values,
  idPrefix,
}: {
  filterOptions: AffiliateFilterOptions;
  onFilterChange: (key: FilterKey, value: string) => void;
  values: Record<FilterKey, string>;
  idPrefix: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <FilterSelect id={`${idPrefix}-region`} label="Region" options={filterOptions.regions} value={values.region} onChange={(value) => onFilterChange("region", value)} />
      <FilterSelect id={`${idPrefix}-city`} label="City" options={filterOptions.cities} value={values.city} onChange={(value) => onFilterChange("city", value)} />
      <FilterSelect id={`${idPrefix}-type`} label="Institution Type" options={filterOptions.institutionTypes} value={values.type} onChange={(value) => onFilterChange("type", value)} />
      <FilterSelect id={`${idPrefix}-service`} label="Service" options={filterOptions.services} value={values.service} onChange={(value) => onFilterChange("service", value)} />
    </div>
  );
}

export function AffiliateDirectory({ affiliates, filterOptions }: AffiliateDirectoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(queryFromUrl);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const updateParams = useCallback((updates: Partial<Record<string, string>>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (query === queryFromUrl) return;
    const timer = window.setTimeout(() => updateParams({ q: query.trim() }), 250);
    return () => window.clearTimeout(timer);
  }, [query, queryFromUrl, updateParams]);

  const optionValue = useCallback((key: keyof AffiliateFilterOptions, param: string) => {
    const value = searchParams.get(param) ?? "";
    return filterOptions[key].some((option) => option.value === value) ? value : "";
  }, [filterOptions, searchParams]);

  const values = useMemo<Record<FilterKey, string>>(() => ({
    region: optionValue("regions", "region"),
    city: optionValue("cities", "city"),
    type: optionValue("institutionTypes", "type"),
    service: optionValue("services", "service"),
  }), [optionValue]);

  const view = searchParams.get("view") === "list" ? "list" : "grid";
  const filtered = useMemo(() => filterAffiliates(affiliates, {
    query,
    region: values.region,
    city: values.city,
    service: values.service,
    institutionType: values.type ? values.type as InstitutionType : null,
  }), [affiliates, query, values]);

  const filterLabels: Record<FilterKey, string> = {
    region: filterOptions.regions.find((option) => option.value === values.region)?.label ?? "",
    city: filterOptions.cities.find((option) => option.value === values.city)?.label ?? "",
    service: filterOptions.services.find((option) => option.value === values.service)?.label ?? "",
    type: values.type ? getInstitutionTypeLabel(values.type as InstitutionType) : "",
  };
  const activeFilters = (Object.keys(values) as FilterKey[]).filter((key) => values[key]);
  const activeCount = activeFilters.length + (query.trim() ? 1 : 0);

  function onFilterChange(key: FilterKey, value: string) {
    updateParams({ [key]: value });
  }

  function clearFilters() {
    setQuery("");
    updateParams({ q: "", region: "", city: "", type: "", service: "" });
  }

  return (
    <div>
      <div className="rounded-panel border border-primary-100 bg-primary-50/70 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <label htmlFor="affiliate-search" className="block flex-1">
            <span className="text-meta uppercase text-institutional">Search the network</span>
            <span className="relative mt-2 block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="affiliate-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by credit union, city, region or service"
                className="min-h-12 w-full rounded-control border border-border bg-surface pl-12 pr-4 text-base text-foreground outline-none transition-[border-color,box-shadow] duration-fast placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20"
              />
            </span>
          </label>

          <Dialog.Root open={filtersOpen} onOpenChange={setFiltersOpen}>
            <Dialog.Trigger asChild>
              <Button variant="secondary" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[70] bg-institutional/60 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in" />
              <Dialog.Content className="fixed inset-x-0 bottom-0 z-[80] max-h-[90dvh] overflow-y-auto rounded-t-panel bg-surface p-6 shadow-raised focus:outline-none sm:left-auto sm:right-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[28rem] sm:rounded-none">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="font-display text-h3 text-institutional">Filter affiliates</Dialog.Title>
                    <Dialog.Description className="mt-2 text-sm text-muted-foreground">Narrow the directory using available, source-supported fields.</Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon" aria-label="Close filters"><X className="h-5 w-5" /></Button>
                  </Dialog.Close>
                </div>
                <div className="mt-8">
                  <FilterFields filterOptions={filterOptions} onFilterChange={onFilterChange} values={values} idPrefix="mobile" />
                </div>
                <div className="mt-8 flex gap-3 border-t border-border pt-5">
                  <Button className="flex-1" onClick={() => setFiltersOpen(false)}>Show {filtered.length} {filtered.length === 1 ? "result" : "results"}</Button>
                  {activeFilters.length > 0 && <Button variant="secondary" onClick={clearFilters}>Clear All</Button>}
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        <div className="mt-5 hidden border-t border-primary-100 pt-5 lg:block">
          <FilterFields filterOptions={filterOptions} onFilterChange={onFilterChange} values={values} idPrefix="desktop" />
        </div>
      </div>

      {activeCount > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2" aria-label="Active filters">
          {query.trim() && (
            <button onClick={() => setQuery("")} className="inline-flex min-h-9 items-center gap-2 rounded-pill border border-primary-200 bg-primary-50 px-3 text-xs font-semibold text-primary-800 transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
              Search: &ldquo;{query.trim()}&rdquo; <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
          {activeFilters.map((key) => (
            <button key={key} onClick={() => onFilterChange(key, "")} className="inline-flex min-h-9 items-center gap-2 rounded-pill border border-primary-200 bg-primary-50 px-3 text-xs font-semibold text-primary-800 transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
              {filterLabels[key]} <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ))}
          <button onClick={clearFilters} className="min-h-9 rounded-sm px-2 text-xs font-semibold text-muted-foreground underline decoration-border underline-offset-4 hover:text-institutional focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">Clear All</button>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="font-semibold text-institutional">
          {filtered.length} {filtered.length === 1 ? "affiliate" : "affiliates"}
          <span className="font-normal text-muted-foreground"> found</span>
        </p>
        <div className="flex flex-wrap items-center gap-2" aria-label="Directory views">
          <Button variant={view === "grid" ? "default" : "ghost"} size="sm" aria-pressed={view === "grid"} onClick={() => updateParams({ view: "" })}>
            <Grid2X2 className="h-4 w-4" aria-hidden="true" /> Grid
          </Button>
          <Button variant={view === "list" ? "default" : "ghost"} size="sm" aria-pressed={view === "list"} onClick={() => updateParams({ view: "list" })}>
            <List className="h-4 w-4" aria-hidden="true" /> List
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/network/map"><Map className="h-4 w-4" aria-hidden="true" /> Map</Link>
          </Button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div id="affiliate-results" className={cn("mt-7 grid gap-5", view === "grid" ? "md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
          {filtered.map((affiliate) => <AffiliateCard key={affiliate.id} affiliate={affiliate} view={view} />)}
        </div>
      ) : (
        <EmptyState
          className="mt-7"
          icon={Search}
          title="No affiliates match these filters"
          description="Try a broader search or clear the selected filters to see all source-listed entries."
          action={<Button onClick={clearFilters}>Clear All</Button>}
        />
      )}
    </div>
  );
}
