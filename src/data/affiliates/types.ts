export interface Region {
  id: string;
  name: string;
  slug: string;
  countryCode: "CM";
  active: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
}

export const institutionTypes = [
  "cooperative-credit-union",
  "thrift-and-loan-cooperative",
  "other-cooperative-financial-institution",
] as const;

export type InstitutionType = (typeof institutionTypes)[number];

export const verificationStatuses = [
  "unverified",
  "source-listed",
  "institution-verified",
  "needs-review",
] as const;

export type VerificationStatus = (typeof verificationStatuses)[number];

export interface AffiliateSource {
  label: string;
  url: string;
  asOf: string | null;
}

export type AffiliateDataClassification =
  | "demo-safe-source-reference"
  | "demo-fixture";

/**
 * Database-neutral public affiliate record.
 *
 * Nullable fields are intentional: absence means the value has not been
 * verified for public use. A future repository/database adapter can return
 * this shape without changing search and filtering consumers.
 */
export interface Affiliate {
  id: string;
  name: string;
  acronym: string;
  slug: string;
  logo: string | null;
  shortDescription: string | null;
  region: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  services: readonly string[];
  institutionType: InstitutionType | null;
  verificationStatus: VerificationStatus;
  active: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  dataClassification: AffiliateDataClassification;
  source: AffiliateSource | null;
}
