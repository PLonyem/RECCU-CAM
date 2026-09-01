"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { TrainingProgramCard } from "@/components/vtime/TrainingProgramCard";
import { Button, Card, EmptyState } from "@/components/ui";
import {
  filterTrainingPrograms,
  getTrainingAudienceOptions,
  trainingCategories,
  trainingFormatLabels,
  trainingLevelLabels,
  trainingPrograms,
  type TrainingFormat,
  type TrainingLevel,
  type TrainingProgramFilters,
} from "@/data/training-programs";

const inputClassName =
  "min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-fast placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20";

export function ProgramsExplorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<TrainingProgramFilters>(() => readFilters(searchParams));
  const filtersRef = useRef(filters);
  const query = filters.query ?? "";

  const results = filterTrainingPrograms(trainingPrograms, filters);
  const audienceOptions = useMemo(() => getTrainingAudienceOptions(), []);
  const activeFilterCount = [query, filters.category, filters.audience, filters.format, filters.level, filters.date]
    .filter(Boolean)
    .length;

  function updateFilter(name: keyof TrainingProgramFilters, value: string) {
    const nextFilters = { ...filtersRef.current, [name]: value } as TrainingProgramFilters;
    filtersRef.current = nextFilters;
    setFilters(nextFilters);
    updateUrl(nextFilters);
  }

  function updateUrl(nextFilters: TrainingProgramFilters) {
    const params = new URLSearchParams();
    const entries: [string, string | undefined][] = [
      ["q", nextFilters.query],
      ["category", nextFilters.category],
      ["audience", nextFilters.audience],
      ["format", nextFilters.format],
      ["level", nextFilters.level],
      ["date", nextFilters.date],
    ];
    for (const [name, value] of entries) {
      if (value) params.set(name, value);
    }
    const nextQuery = params.toString();
    window.history.replaceState(null, "", nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }

  function updateQuery(value: string) {
    updateFilter("query", value.trim());
  }

  function clearFilters() {
    const clearedFilters: TrainingProgramFilters = {};
    filtersRef.current = clearedFilters;
    setFilters(clearedFilters);
    window.history.replaceState(null, "", pathname);
  }

  return (
    <div>
      <Card padding="default" className="shadow-raised">
        <div className="flex items-center gap-2 text-sm font-semibold text-institutional">
          <SlidersHorizontal className="h-4 w-4 text-forest" aria-hidden="true" />
          Find a learning pathway
        </div>
        <div className="relative mt-5">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="program-search" className="sr-only">Search programs</label>
          <input
            id="program-search"
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            className={`${inputClassName} pl-11`}
            placeholder="Search by program, category, audience, objective or module"
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <FilterSelect
            label="Category"
            value={filters.category ?? ""}
            onChange={(value) => updateFilter("category", value)}
            options={trainingCategories.map((category) => ({ value: category.slug, label: category.title }))}
          />
          <FilterSelect
            label="Audience"
            value={filters.audience ?? ""}
            onChange={(value) => updateFilter("audience", value)}
            options={audienceOptions.map((audience) => ({ value: audience, label: audience }))}
          />
          <FilterSelect
            label="Format"
            value={filters.format ?? ""}
            onChange={(value) => updateFilter("format", value)}
            options={(Object.entries(trainingFormatLabels) as [TrainingFormat, string][]).map(([value, label]) => ({ value, label }))}
          />
          <FilterSelect
            label="Level"
            value={filters.level ?? ""}
            onChange={(value) => updateFilter("level", value)}
            options={(Object.entries(trainingLevelLabels) as [TrainingLevel, string][]).map(([value, label]) => ({ value, label }))}
          />
          <FilterSelect
            label="Date"
            value={filters.date ?? ""}
            onChange={(value) => updateFilter("date", value)}
            options={[
              { value: "scheduled", label: "Scheduled" },
              { value: "pending", label: "Schedule pending" },
            ]}
          />
        </div>
      </Card>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-semibold text-institutional">{results.length}</span>{" "}
          {results.length === 1 ? "program" : "programs"}
        </p>
        {activeFilterCount > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4" aria-hidden="true" /> Clear filters ({activeFilterCount})
          </Button>
        )}
      </div>

      {results.length > 0 ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {results.map((program) => (
            <TrainingProgramCard key={program.id} program={program} detailed />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          icon={Search}
          title="No programs match these filters"
          description="Try a broader search or clear one or more filters. Programs without verified delivery details remain available under Schedule pending."
          action={
            <Button type="button" variant="secondary" onClick={clearFilters}>
              Clear all filters
            </Button>
          }
        />
      )}
    </div>
  );
}

function readFilters(searchParams: { get: (name: string) => string | null }): TrainingProgramFilters {
  return {
    query: searchParams.get("q") ?? "",
    category: (searchParams.get("category") ?? "") as TrainingProgramFilters["category"],
    audience: searchParams.get("audience") ?? "",
    format: (searchParams.get("format") ?? "") as TrainingProgramFilters["format"],
    level: (searchParams.get("level") ?? "") as TrainingProgramFilters["level"],
    date: (searchParams.get("date") ?? "") as TrainingProgramFilters["date"],
  };
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}

function FilterSelect({ label, onChange, options, value }: FilterSelectProps) {
  const id = `program-filter-${label.toLocaleLowerCase().replaceAll(" ", "-")}`;
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={inputClassName}>
        <option value="">All {label.toLocaleLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
