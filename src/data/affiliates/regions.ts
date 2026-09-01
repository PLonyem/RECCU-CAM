import type { Region } from "./types";

/** Only regions represented by the current source-labelled starter records. */
export const regions: readonly Region[] = [
  {
    id: "north-west",
    name: "North-West Region",
    slug: "north-west",
    countryCode: "CM",
    active: true,
  },
];

export function getRegionById(id: string | null | undefined) {
  if (!id) return undefined;
  return regions.find((region) => region.id === id);
}
