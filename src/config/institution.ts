export const institution = {
  brandName: "RECCU-CAM",
  displayName: "RECCU-CAM LTD",
  legalName:
    "Union of Renaissance Cooperative Credit Unions in Cameroon Ltd",
  shortDescription:
    "A cooperative credit-union network headquartered in Bamenda, Cameroon.",
  platformStatement:
    "One trusted digital home for network services, learning, knowledge, and cooperative connection.",
  tagline: "Cooperation. Confidence. Shared progress.",
  location: {
    city: "Bamenda",
    region: "North-West Region",
    country: "Cameroon",
  },
  approval: {
    order: "N°000279/MINFI",
    date: "2018-04-05",
    authority: "Ministry of Finance, Cameroon",
    sourceLabel: "MINFI list of approved microfinance institutions",
    sourceUrl:
      "https://minfi.gov.cm/liste-des-etablissements-de-microfinance-agrees-au-31-decembre-2021/amp/",
  },
  contact: {
    email: null,
    phone: null,
    streetAddress: null,
  },
  social: {
    facebook: null,
    linkedin: null,
    youtube: null,
  },
} as const;

const deploymentHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

function normalizeSiteUrl(value: string | undefined) {
  if (!value) return null;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/$/, "");
}

export const siteUrl =
  normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
  normalizeSiteUrl(deploymentHost) ||
  "http://localhost:3000";

export const verificationNotice =
  "Only institution details supported by the cited public source are published. Current contacts, leadership, network totals, rates, and event dates remain unpublished until confirmed by RECCU-CAM.";
