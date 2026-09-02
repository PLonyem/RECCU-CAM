/**
 * Public affiliate data entry point.
 *
 * New consumers should use `affiliates` and the typed helpers exported from
 * this module. `networkAffiliates` remains a compact public-view adapter and
 * is not the canonical model.
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
  sourceUrl: string;
}

export const networkAffiliates: NetworkAffiliate[] = affiliates.flatMap((affiliate) => {
  const region = getRegionById(affiliate.region);

  if (!affiliate.city || !region || !affiliate.source) return [];

  return [{
    code: affiliate.acronym,
    name: affiliate.name,
    shortName: affiliate.acronym,
    city: affiliate.city,
    region: region.name,
    sourceUrl: affiliate.source.url,
  }];
});

export const affiliateRegions = Array.from(
  new Set(networkAffiliates.map((affiliate) => affiliate.region)),
);
