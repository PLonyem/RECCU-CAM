import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveAffiliateFilterOptions,
  filterAffiliatesByCity,
  filterAffiliatesByRegion,
  filterAffiliatesByService,
  filterAffiliatesByType,
  getAffiliateBySlug,
  searchAffiliates,
} from "./helpers";
import { affiliates } from "./records";
import type { Affiliate } from "./types";

const demoAffiliates: readonly Affiliate[] = [
  {
    id: "demo-north",
    name: "Demo North Cooperative",
    acronym: "DNC",
    slug: "demo-north",
    logo: null,
    shortDescription: "Explicit test fixture for community finance.",
    region: "north-west",
    city: "Demo City",
    address: null,
    latitude: null,
    longitude: null,
    phone: null,
    email: null,
    website: null,
    services: ["capacity-building", "affiliate-banking"],
    institutionType: "cooperative-credit-union",
    verificationStatus: "unverified",
    active: true,
    createdAt: null,
    updatedAt: null,
    dataClassification: "demo-fixture",
    source: null,
  },
  {
    id: "demo-south",
    name: "Demo South Thrift Cooperative",
    acronym: "DSTC",
    slug: "demo-south",
    logo: null,
    shortDescription: null,
    region: "south-west",
    city: "Another City",
    address: null,
    latitude: null,
    longitude: null,
    phone: null,
    email: null,
    website: null,
    services: ["digital-transformation"],
    institutionType: "thrift-and-loan-cooperative",
    verificationStatus: "unverified",
    active: null,
    createdAt: null,
    updatedAt: null,
    dataClassification: "demo-fixture",
    source: null,
  },
];

test("searches across name, acronym, description, city, and region label", () => {
  assert.deepEqual(searchAffiliates(demoAffiliates, "dnc").map((item) => item.slug), ["demo-north"]);
  assert.deepEqual(searchAffiliates(demoAffiliates, "community finance").map((item) => item.slug), ["demo-north"]);
  assert.deepEqual(searchAffiliates(demoAffiliates, "North-West Region").map((item) => item.slug), ["demo-north"]);
  assert.equal(searchAffiliates(demoAffiliates, "missing").length, 0);
});

test("filters affiliates by region and city without case sensitivity", () => {
  assert.deepEqual(filterAffiliatesByRegion(demoAffiliates, "NORTH-WEST").map((item) => item.slug), ["demo-north"]);
  assert.deepEqual(filterAffiliatesByCity(demoAffiliates, "demo city").map((item) => item.slug), ["demo-north"]);
});

test("filters affiliates by service and institution type", () => {
  assert.deepEqual(filterAffiliatesByService(demoAffiliates, "affiliate-banking").map((item) => item.slug), ["demo-north"]);
  assert.deepEqual(filterAffiliatesByType(demoAffiliates, "thrift-and-loan-cooperative").map((item) => item.slug), ["demo-south"]);
});

test("gets an affiliate by normalized slug", () => {
  assert.equal(getAffiliateBySlug(demoAffiliates, " DEMO-NORTH ")?.id, "demo-north");
  assert.equal(getAffiliateBySlug(demoAffiliates, "unknown"), undefined);
});

test("derives sorted, deduplicated options only from represented values", () => {
  const options = deriveAffiliateFilterOptions(demoAffiliates);
  assert.deepEqual(options.cities.map((option) => option.value), ["Another City", "Demo City"]);
  assert.deepEqual(options.regions, [
    { value: "north-west", label: "North-West Region" },
    { value: "south-west", label: "South West" },
  ]);
  assert.deepEqual(options.services.map((option) => option.value), [
    "affiliate-banking",
    "capacity-building",
    "digital-transformation",
  ]);
  assert.deepEqual(options.institutionTypes.map((option) => option.value), [
    "cooperative-credit-union",
    "thrift-and-loan-cooperative",
  ]);
});

test("source records leave unknown details null instead of inventing them", () => {
  for (const affiliate of affiliates) {
    assert.equal(affiliate.logo, null);
    assert.equal(affiliate.shortDescription, null);
    assert.equal(affiliate.address, null);
    assert.equal(affiliate.latitude, null);
    assert.equal(affiliate.longitude, null);
    assert.equal(affiliate.phone, null);
    assert.equal(affiliate.email, null);
    assert.equal(affiliate.website, null);
    assert.deepEqual(affiliate.services, []);
    assert.equal(affiliate.institutionType, null);
    assert.equal(affiliate.active, null);
    assert.equal(affiliate.createdAt, null);
    assert.equal(affiliate.updatedAt, null);
    assert.equal(affiliate.dataClassification, "demo-safe-source-reference");
  }
});
