import type { Affiliate } from "@/data/affiliates";
import type { PublishedNewsArticle } from "@/data/news";
import type { TrainingProgram } from "@/data/training-programs";
import { slugify } from "@/lib/slug";

interface PublicAffiliateRecord {
  id: string;
  code: string;
  name: string;
  region: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  description: string | null;
  services: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface PublicNewsRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: Date | null;
  updatedAt: Date;
  authorName: string;
  featured: boolean;
}

interface PublicTrainingRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  audience: string[];
  level: string;
  format: string | null;
  venue: string | null;
  startDate: Date | null;
  endDate: Date | null;
  capacity: number | null;
  registrationStatus: string;
}

function dateOnly(value: Date | null) {
  return value?.toISOString().slice(0, 10) ?? null;
}

function publicRegionId(value: string) {
  return value.trim().toLocaleLowerCase("en").replaceAll(" ", "-").replace("northwest", "north-west").replace("southwest", "south-west");
}

export function mapPublicAffiliate(record: PublicAffiliateRecord): Affiliate {
  return {
    id: record.id,
    name: record.name,
    acronym: record.code,
    slug: slugify(record.code),
    logo: record.logoUrl,
    shortDescription: record.description,
    region: publicRegionId(record.region),
    city: record.city,
    address: record.address,
    latitude: null,
    longitude: null,
    phone: record.phone,
    email: record.email,
    website: record.website,
    services: record.services,
    institutionType: null,
    verificationStatus: "institution-verified",
    active: true,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    dataClassification: "database-managed",
    source: null,
  };
}

export function mapPublicNewsArticle(record: PublicNewsRecord): PublishedNewsArticle | null {
  if (!record.publishedAt) return null;

  return {
    id: record.id,
    kind: "article",
    slug: record.slug,
    title: record.title,
    summary: record.excerpt,
    body: record.content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
    category: record.category,
    publishedAt: dateOnly(record.publishedAt)!,
    updatedAt: dateOnly(record.updatedAt),
    authorName: record.authorName,
    featured: record.featured,
  };
}

export function mapPublicTrainingProgram(record: PublicTrainingRecord): TrainingProgram {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    summary: record.summary,
    category: record.category,
    audience: record.audience,
    level: record.level,
    format: record.format,
    location: record.venue,
    startDate: dateOnly(record.startDate),
    endDate: dateOnly(record.endDate),
    duration: null,
    facilitator: null,
    objectives: [],
    modules: [],
    requirements: [],
    capacity: record.capacity,
    registrationStatus: record.registrationStatus,
  };
}
