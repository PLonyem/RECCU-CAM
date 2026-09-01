export interface NetworkAffiliate {
  code: string;
  name: string;
  shortName: string;
  city: string;
  region: string;
  mapPosition: { x: number; y: number };
  sourceUrl: string;
}

const MINFI_SOURCE =
  "https://minfi.gov.cm/liste-des-etablissements-de-microfinance-agrees-au-31-decembre-2021/amp/";

// Verified starter directory from MINFI's list as at 31 December 2021.
// It is intentionally not presented as a complete or current member count.
export const networkAffiliates: NetworkAffiliate[] = [
  {
    code: "AZICCUL",
    name: "Azire Cooperative Credit Union Ltd",
    shortName: "AZICCUL",
    city: "Bamenda",
    region: "North-West Region",
    mapPosition: { x: 35, y: 26 },
    sourceUrl: MINFI_SOURCE,
  },
  {
    code: "BAMCCUL",
    name: "Bambili Cooperative Credit Union Ltd",
    shortName: "BAMCCUL",
    city: "Bambili",
    region: "North-West Region",
    mapPosition: { x: 43, y: 23 },
    sourceUrl: MINFI_SOURCE,
  },
  {
    code: "KIPCCUL",
    name: "Kimbo Police Cooperative Credit Union Ltd",
    shortName: "KIPCCUL",
    city: "Bamenda",
    region: "North-West Region",
    mapPosition: { x: 32, y: 31 },
    sourceUrl: MINFI_SOURCE,
  },
  {
    code: "MBACCUL",
    name: "Mbatu Cooperative Credit Union Ltd",
    shortName: "MBACCUL",
    city: "Bamenda",
    region: "North-West Region",
    mapPosition: { x: 40, y: 29 },
    sourceUrl: MINFI_SOURCE,
  },
  {
    code: "SACCUL",
    name: "Santa Cooperative Credit Union Ltd",
    shortName: "SACCUL",
    city: "Santa",
    region: "North-West Region",
    mapPosition: { x: 45, y: 36 },
    sourceUrl: MINFI_SOURCE,
  },
  {
    code: "NTAMCCUL",
    name: "Ntambeng Cooperative Credit Union Ltd",
    shortName: "NTAMCCUL",
    city: "Bamenda",
    region: "North-West Region",
    mapPosition: { x: 36, y: 34 },
    sourceUrl: MINFI_SOURCE,
  },
  {
    code: "BASOFDEV",
    name: "Bamendankwe Solidarity Fund for Development Thrift and Loan Cooperative Society",
    shortName: "BASOFDEV",
    city: "Bamenda",
    region: "North-West Region",
    mapPosition: { x: 39, y: 25 },
    sourceUrl: MINFI_SOURCE,
  },
];

export const affiliateRegions = Array.from(
  new Set(networkAffiliates.map((affiliate) => affiliate.region)),
);
