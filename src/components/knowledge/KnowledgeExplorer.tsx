"use client";

import { ArrowRight, FileSearch, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Badge, Button, Card, EmptyState, FilterDrawer } from "@/components/ui";
import {
  filterKnowledgeDocuments,
  formatKnowledgeDate,
  getKnowledgeCategory,
  getKnowledgeFilterOptions,
  knowledgeAccessLevelLabels,
  knowledgeCategories,
  knowledgeDocumentTypes,
  knowledgeSortLabels,
  publicKnowledgeDocuments,
  type KnowledgeAccessLevel,
  type KnowledgeDocumentType,
  type KnowledgeFilters,
  type KnowledgeSort,
} from "@/data/knowledge";

const inputClassName =
  "min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-fast placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20";

export function KnowledgeExplorer() {
  const searchParams = useSearchParams();
  return <KnowledgeExplorerContent key={searchParams.toString()} initialSearchParams={searchParams} />;
}

function KnowledgeExplorerContent({ initialSearchParams }: { initialSearchParams: SearchParamsLike }) {
  const pathname = usePathname();
  const [filters, setFilters] = useState<KnowledgeFilters>(() => readFilters(initialSearchParams));
  const filtersRef = useRef(filters);
  const filterOptions = useMemo(() => getKnowledgeFilterOptions(), []);
  const results = filterKnowledgeDocuments(publicKnowledgeDocuments, filters);
  const activeFilterCount = [
    filters.query,
    filters.category,
    filters.issuingAuthority,
    filters.year,
    filters.documentType,
    filters.accessLevel,
  ].filter(Boolean).length;

  function updateFilter(name: keyof KnowledgeFilters, value: string) {
    const nextFilters = { ...filtersRef.current, [name]: value } as KnowledgeFilters;
    filtersRef.current = nextFilters;
    setFilters(nextFilters);
    updateUrl(nextFilters);
  }

  function updateUrl(nextFilters: KnowledgeFilters) {
    const params = new URLSearchParams();
    const entries: [string, string | undefined][] = [
      ["q", nextFilters.query],
      ["category", nextFilters.category],
      ["authority", nextFilters.issuingAuthority],
      ["year", nextFilters.year],
      ["type", nextFilters.documentType],
      ["access", nextFilters.accessLevel],
      ["sort", nextFilters.sort && nextFilters.sort !== "newest" ? nextFilters.sort : undefined],
    ];
    for (const [name, value] of entries) {
      if (value) params.set(name, value);
    }
    const nextQuery = params.toString();
    window.history.replaceState(null, "", nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }

  function clearFilters() {
    const cleared: KnowledgeFilters = { sort: "newest" };
    filtersRef.current = cleared;
    setFilters(cleared);
    window.history.replaceState(null, "", pathname);
  }

  const restrictedSelection =
    filters.accessLevel === "affiliate-only" || filters.accessLevel === "staff-only";

  return (
    <div>
      <Card padding="default" className="shadow-raised">
        <div className="flex items-center gap-2 text-sm font-semibold text-institutional">
          <SlidersHorizontal className="h-4 w-4 text-forest" aria-hidden="true" />
          Search the public collection
        </div>
        <div className="relative mt-5">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="knowledge-search" className="sr-only">Search the Knowledge Centre</label>
          <input
            id="knowledge-search"
            type="search"
            value={filters.query ?? ""}
            onChange={(event) => updateFilter("query", event.target.value)}
            className={`${inputClassName} pl-11`}
            placeholder="Search regulations, circulars, reports, guides and templates"
          />
        </div>
        <FilterDrawer
          activeCount={activeFilterCount}
          title="Filter public documents"
          description="Narrow the source-labelled public collection. Restricted records remain unexposed."
          resultLabel={`Show ${results.length} ${results.length === 1 ? "document" : "documents"}`}
          onClear={clearFilters}
        >
          <KnowledgeFilterFields
            idPrefix="mobile"
            filters={filters}
            filterOptions={filterOptions}
            updateFilter={updateFilter}
          />
        </FilterDrawer>
        <div className="mt-4 hidden gap-4 lg:grid lg:grid-cols-3">
          <KnowledgeFilterFields
            idPrefix="desktop"
            filters={filters}
            filterOptions={filterOptions}
            updateFilter={updateFilter}
          />
        </div>
      </Card>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-semibold text-institutional">{results.length}</span>{" "}
          {results.length === 1 ? "public document" : "public documents"}
        </p>
        {activeFilterCount > 0 && (
          <Button type="button" size="sm" variant="ghost" onClick={clearFilters}>
            <X className="h-4 w-4" aria-hidden="true" /> Clear filters ({activeFilterCount})
          </Button>
        )}
      </div>

      {results.length > 0 ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {results.map((document) => {
            const category = getKnowledgeCategory(document.category);
            return (
              <Card key={document.id} padding="default" className="flex h-full flex-col">
                <div className="flex flex-wrap gap-2">
                  {category && <Badge variant="primary">{category.title}</Badge>}
                  <Badge>{document.documentType}</Badge>
                  <Badge variant="success">{knowledgeAccessLevelLabels[document.accessLevel]}</Badge>
                  {document.featured && <Badge variant="accent">Featured</Badge>}
                </div>
                <h3 className="mt-5 font-display text-h4 text-institutional">{document.title}</h3>
                <p className="mt-3 text-body text-muted-foreground">{document.description}</p>
                <dl className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-meta uppercase text-gold-strong">Issuing authority</dt>
                    <dd className="mt-1 text-sm text-foreground">{document.issuingAuthority ?? "Not published"}</dd>
                  </div>
                  <div>
                    <dt className="text-meta uppercase text-gold-strong">Publication date</dt>
                    <dd className="mt-1 text-sm text-foreground">{formatKnowledgeDate(document.publicationDate)}</dd>
                  </div>
                </dl>
                <div className="mt-auto pt-6">
                  <Link
                    href={`/knowledge/${document.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-forest underline-offset-4 hover:text-institutional hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
                  >
                    View document details <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          icon={restrictedSelection ? FileSearch : Search}
          title={restrictedSelection ? "Restricted documents are not exposed" : "No public documents match these filters"}
          description={
            restrictedSelection
              ? "Affiliate-only and staff-only resources require authenticated, authorized workflows. This public prototype does not list their metadata or files."
              : "Try a broader search or clear one or more filters. Unverified documents are not added as placeholders."
          }
          action={
            <Button type="button" variant="secondary" onClick={clearFilters}>Clear all filters</Button>
          }
        />
      )}
    </div>
  );
}

interface FilterSelectProps {
  idPrefix: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  includeAll?: boolean;
  emptyLabel?: string;
}

function FilterSelect({ emptyLabel, idPrefix, includeAll = true, label, onChange, options, value }: FilterSelectProps) {
  const id = `${idPrefix}-knowledge-filter-${label.toLocaleLowerCase().replaceAll(" ", "-")}`;
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={inputClassName}>
        {includeAll && <option value="">All {label.toLocaleLowerCase()}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
        {options.length === 0 && emptyLabel && <option value="unavailable" disabled>{emptyLabel}</option>}
      </select>
    </label>
  );
}

function KnowledgeFilterFields({
  filterOptions,
  filters,
  idPrefix,
  updateFilter,
}: {
  filterOptions: ReturnType<typeof getKnowledgeFilterOptions>;
  filters: KnowledgeFilters;
  idPrefix: string;
  updateFilter: (name: keyof KnowledgeFilters, value: string) => void;
}) {
  return (
    <>
      <FilterSelect
        idPrefix={idPrefix}
        label="Category"
        value={filters.category ?? ""}
        onChange={(value) => updateFilter("category", value)}
        options={knowledgeCategories.map((category) => ({ value: category.slug, label: category.title }))}
      />
      <FilterSelect
        idPrefix={idPrefix}
        label="Issuing authority"
        value={filters.issuingAuthority ?? ""}
        onChange={(value) => updateFilter("issuingAuthority", value)}
        options={filterOptions.authorities.map((authority) => ({ value: authority, label: authority }))}
      />
      <FilterSelect
        idPrefix={idPrefix}
        label="Year"
        value={filters.year ?? ""}
        onChange={(value) => updateFilter("year", value)}
        options={filterOptions.years.map((year) => ({ value: year, label: year }))}
        emptyLabel="No verified publication years"
      />
      <FilterSelect
        idPrefix={idPrefix}
        label="Document type"
        value={filters.documentType ?? ""}
        onChange={(value) => updateFilter("documentType", value)}
        options={knowledgeDocumentTypes.map((type) => ({ value: type, label: type }))}
      />
      <FilterSelect
        idPrefix={idPrefix}
        label="Access level"
        value={filters.accessLevel ?? ""}
        onChange={(value) => updateFilter("accessLevel", value)}
        options={(Object.entries(knowledgeAccessLevelLabels) as [KnowledgeAccessLevel, string][]).map(
          ([value, label]) => ({ value, label }),
        )}
      />
      <FilterSelect
        idPrefix={idPrefix}
        label="Sort by"
        value={filters.sort ?? "newest"}
        onChange={(value) => updateFilter("sort", value)}
        includeAll={false}
        options={(Object.entries(knowledgeSortLabels) as [KnowledgeSort, string][]).map(
          ([value, label]) => ({ value, label }),
        )}
      />
    </>
  );
}

interface SearchParamsLike {
  get: (name: string) => string | null;
}

function readFilters(searchParams: SearchParamsLike): KnowledgeFilters {
  return {
    query: searchParams.get("q") ?? "",
    category: (searchParams.get("category") ?? "") as KnowledgeFilters["category"],
    issuingAuthority: searchParams.get("authority") ?? "",
    year: searchParams.get("year") ?? "",
    documentType: (searchParams.get("type") ?? "") as KnowledgeDocumentType | "",
    accessLevel: (searchParams.get("access") ?? "") as KnowledgeAccessLevel | "",
    sort: (searchParams.get("sort") ?? "newest") as KnowledgeSort,
  };
}
