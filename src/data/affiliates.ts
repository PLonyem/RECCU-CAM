/**
 * Public affiliate data entry point.
 *
 * New consumers should use `affiliates` and the typed helpers exported from
 * this module. `networkAffiliates` remains as a temporary view adapter for
 * the existing Stage 0 map/directory UI and is not the canonical model.
 */
export * from "./affiliates/index";

import { affiliates } from "./affiliates/records";
import { getRegionById } from "./affiliates/regions";

export interface NetworkAffiliate {
  code: string;
  name: string;
  shortName: string;
  city: string;
  region: string;
  mapPosition: { x: number; y: number };
  sourceUrl: string;
}

/**
 * UI-only positions for the existing illustrative map canvas.
 * These are not latitude/longitude and must never be treated as addresses.
 */
const illustrativeMapPositions: Readonly<Record<string, { x: number; y: number }>> = {
  aziccul: { x: 35, y: 26 },
  bamccul: { x: 43, y: 23 },
  kipccul: { x: 32, y: 31 },
  mbaccul: { x: 40, y: 29 },
  saccul: { x: 45, y: 36 },
  ntamccul: { x: 36, y: 34 },
  basofdev: { x: 39, y: 25 },
};

export const networkAffiliates: NetworkAffiliate[] = affiliates.flatMap((affiliate) => {
  const region = getRegionById(affiliate.region);
  const mapPosition = illustrativeMapPositions[affiliate.slug];

  if (!affiliate.city || !region || !mapPosition || !affiliate.source) return [];

  return [{
    code: affiliate.acronym,
    name: affiliate.name,
    shortName: affiliate.acronym,
    city: affiliate.city,
    region: region.name,
    mapPosition,
    sourceUrl: affiliate.source.url,
  }];
});

export const affiliateRegions = Array.from(
  new Set(networkAffiliates.map((affiliate) => affiliate.region)),
);
