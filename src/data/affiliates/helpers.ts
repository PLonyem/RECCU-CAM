import { affiliateServiceCategories } from "./services";
import { regions } from "./regions";
import { institutionTypes, type Affiliate, type InstitutionType } from "./types";

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

export interface AffiliateFilterOptions {
  regions: FilterOption[];
  cities: FilterOption[];
  services: FilterOption[];
  institutionTypes: FilterOption<InstitutionType>[];
}

export interface AffiliateFilters {
  query?: string | null;
  region?: string | null;
  city?: string | null;
  service?: string | null;
  institutionType?: InstitutionType | null;
}

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("en");
}

function copy(items: readonly Affiliate[]) {
  return Array.from(items);
}

function labelFromSlug(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function searchAffiliates(items: readonly Affiliate[], query: string | null | undefined) {
  const normalizedQuery = normalize(query ?? "");
  if (!normalizedQuery) return copy(items);

  const regionNames = new Map(regions.map((region) => [region.id, region.name]));
  const serviceNames = new Map(
    affiliateServiceCategories.map((service) => [service.slug, service.name]),
  );

  return items.filter((affiliate) =>
    normalize(
      [
        affiliate.name,
        affiliate.acronym,
        affiliate.slug,
        affiliate.shortDescription,
        affiliate.region,
        affiliate.region ? regionNames.get(affiliate.region) : null,
        affiliate.city,
        affiliate.address,
        ...affiliate.services,
        ...affiliate.services.map((service) => serviceNames.get(service) ?? null),
      ]
        .filter((value): value is string => Boolean(value))
        .join(" "),
    ).includes(normalizedQuery),
  );
}

export function filterAffiliates(
  items: readonly Affiliate[],
  filters: AffiliateFilters,
) {
  return filterAffiliatesByType(
    filterAffiliatesByService(
      filterAffiliatesByCity(
        filterAffiliatesByRegion(
          searchAffiliates(items, filters.query),
          filters.region,
        ),
        filters.city,
      ),
      filters.service,
    ),
    filters.institutionType,
  );
}

export function filterAffiliatesByRegion(
  items: readonly Affiliate[],
  region: string | null | undefined,
) {
  const normalizedRegion = normalize(region ?? "");
  if (!normalizedRegion) return copy(items);
  return items.filter((affiliate) => normalize(affiliate.region ?? "") === normalizedRegion);
}

export function filterAffiliatesByCity(
  items: readonly Affiliate[],
  city: string | null | undefined,
) {
  const normalizedCity = normalize(city ?? "");
  if (!normalizedCity) return copy(items);
  return items.filter((affiliate) => normalize(affiliate.city ?? "") === normalizedCity);
}

export function filterAffiliatesByService(
  items: readonly Affiliate[],
  service: string | null | undefined,
) {
  const normalizedService = normalize(service ?? "");
  if (!normalizedService) return copy(items);
  return items.filter((affiliate) =>
    affiliate.services.some((item) => normalize(item) === normalizedService),
  );
}

export function filterAffiliatesByType(
  items: readonly Affiliate[],
  institutionType: InstitutionType | null | undefined,
) {
  if (!institutionType) return copy(items);
  return items.filter((affiliate) => affiliate.institutionType === institutionType);
}

export function getAffiliateBySlug(
  items: readonly Affiliate[],
  slug: string | null | undefined,
) {
  const normalizedSlug = normalize(slug ?? "");
  if (!normalizedSlug) return undefined;
  return items.find((affiliate) => normalize(affiliate.slug) === normalizedSlug);
}

export function deriveAffiliateFilterOptions(
  items: readonly Affiliate[],
): AffiliateFilterOptions {
  const regionIds = new Set(items.flatMap((affiliate) => affiliate.region ? [affiliate.region] : []));
  const cityNames = new Map<string, string>();
  const serviceIds = new Set(items.flatMap((affiliate) => affiliate.services));
  const types = new Set(
    items.flatMap((affiliate) => affiliate.institutionType ? [affiliate.institutionType] : []),
  );

  for (const affiliate of items) {
    if (affiliate.city) cityNames.set(normalize(affiliate.city), affiliate.city);
  }

  const regionLabels = new Map(regions.map((region) => [region.id, region.name]));
  const serviceLabels = new Map(
    affiliateServiceCategories.map((service) => [service.slug, service.name]),
  );

  return {
    regions: Array.from(regionIds, (value) => ({
      value,
      label: regionLabels.get(value) ?? labelFromSlug(value),
    })).sort((a, b) => a.label.localeCompare(b.label)),
    cities: Array.from(cityNames.values(), (value) => ({ value, label: value }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    services: Array.from(serviceIds, (value) => ({
      value,
      label: serviceLabels.get(value) ?? labelFromSlug(value),
    })).sort((a, b) => a.label.localeCompare(b.label)),
    institutionTypes: institutionTypes
      .filter((value) => types.has(value))
      .map((value) => ({ value, label: labelFromSlug(value) })),
  };
}
