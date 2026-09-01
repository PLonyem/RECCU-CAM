export const RECCUCAM_REGION_STRUCTURE = [
  {
    name: "North-West Region",
    code: "NORTHWEST",
    chapters: ["Bamenda", "Bambili", "Santa", "Published directory"],
  },
] as const;

export const RECCUCAM_CHAPTERS = RECCUCAM_REGION_STRUCTURE.flatMap(
  (region) => region.chapters,
);

export type ReccucamRegion = (typeof RECCUCAM_REGION_STRUCTURE)[number]["name"];
export type ReccucamChapter = (typeof RECCUCAM_CHAPTERS)[number];

export function regionNameToCode(name: string) {
  return (
    RECCUCAM_REGION_STRUCTURE.find((region) => region.name === name)?.code ??
    name.replace(/ Region$/i, "").toUpperCase()
  );
}

export function regionCodeToName(code: string) {
  return (
    RECCUCAM_REGION_STRUCTURE.find((region) => region.code === code.toUpperCase())
      ?.name ?? code
  );
}
