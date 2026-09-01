import type { Affiliate, AffiliateSource } from "./types";

export const AFFILIATE_DATA_NOTICE =
  "Demo-safe starter records: names and locations are transcribed from the cited MINFI list as at 31 December 2021. They are not a complete or current membership register. Unknown operational and contact fields remain null.";

export const MINFI_AFFILIATE_SOURCE: AffiliateSource = {
  label: "MINFI list of approved microfinance institutions",
  url: "https://minfi.gov.cm/liste-des-etablissements-de-microfinance-agrees-au-31-decembre-2021/amp/",
  asOf: "2021-12-31",
};

interface SourceListedSeed {
  id: string;
  name: string;
  acronym: string;
  slug: string;
  region: string;
  city: string;
}

function createSourceListedAffiliate(seed: SourceListedSeed): Affiliate {
  return {
    ...seed,
    logo: null,
    shortDescription: null,
    address: null,
    latitude: null,
    longitude: null,
    phone: null,
    email: null,
    website: null,
    services: [],
    institutionType: null,
    verificationStatus: "source-listed",
    active: null,
    createdAt: null,
    updatedAt: null,
    dataClassification: "demo-safe-source-reference",
    source: MINFI_AFFILIATE_SOURCE,
  };
}

/**
 * Source-labelled, demo-safe starter dataset.
 *
 * IDs are local dataset identifiers, not identifiers assigned by an
 * institution or regulator. No operational details are inferred from names.
 */
export const affiliates: readonly Affiliate[] = [
  createSourceListedAffiliate({
    id: "minfi-2021-aziccul",
    name: "Azire Cooperative Credit Union Ltd",
    acronym: "AZICCUL",
    slug: "aziccul",
    region: "north-west",
    city: "Bamenda",
  }),
  createSourceListedAffiliate({
    id: "minfi-2021-bamccul",
    name: "Bambili Cooperative Credit Union Ltd",
    acronym: "BAMCCUL",
    slug: "bamccul",
    region: "north-west",
    city: "Bambili",
  }),
  createSourceListedAffiliate({
    id: "minfi-2021-kipccul",
    name: "Kimbo Police Cooperative Credit Union Ltd",
    acronym: "KIPCCUL",
    slug: "kipccul",
    region: "north-west",
    city: "Bamenda",
  }),
  createSourceListedAffiliate({
    id: "minfi-2021-mbaccul",
    name: "Mbatu Cooperative Credit Union Ltd",
    acronym: "MBACCUL",
    slug: "mbaccul",
    region: "north-west",
    city: "Bamenda",
  }),
  createSourceListedAffiliate({
    id: "minfi-2021-saccul",
    name: "Santa Cooperative Credit Union Ltd",
    acronym: "SACCUL",
    slug: "saccul",
    region: "north-west",
    city: "Santa",
  }),
  createSourceListedAffiliate({
    id: "minfi-2021-ntamccul",
    name: "Ntambeng Cooperative Credit Union Ltd",
    acronym: "NTAMCCUL",
    slug: "ntamccul",
    region: "north-west",
    city: "Bamenda",
  }),
  createSourceListedAffiliate({
    id: "minfi-2021-basofdev",
    name: "Bamendankwe Solidarity Fund for Development Thrift and Loan Cooperative Society",
    acronym: "BASOFDEV",
    slug: "basofdev",
    region: "north-west",
    city: "Bamenda",
  }),
];
