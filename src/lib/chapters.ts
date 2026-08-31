export const CAMCCUL_REGION_STRUCTURE = [
  { name: "Northwest Region", code: "NORTHWEST", chapters: ["Nkambe", "Kumbo", "Bamenda", "Fundong"] },
  { name: "Southwest Region", code: "SOUTHWEST", chapters: ["Kumba", "Fako"] },
  { name: "West Region", code: "WEST", chapters: ["Bafoussam"] },
  { name: "Littoral Region", code: "LITTORAL", chapters: ["Douala", "Yaoundé"] },
  { name: "Far North Region", code: "FAR NORTH", chapters: ["Maroua"] },
] as const;

export const CAMCCUL_CHAPTERS = CAMCCUL_REGION_STRUCTURE.flatMap((region) => region.chapters);

export type CamcculRegion = (typeof CAMCCUL_REGION_STRUCTURE)[number]["name"];
export type CamcculChapter = (typeof CAMCCUL_CHAPTERS)[number];

export function regionNameToCode(name: string) {
  return CAMCCUL_REGION_STRUCTURE.find((region) => region.name === name)?.code ?? name.replace(/ Region$/i, "").toUpperCase();
}

export function regionCodeToName(code: string) {
  return CAMCCUL_REGION_STRUCTURE.find((region) => region.code === code.toUpperCase())?.name ?? code;
}
