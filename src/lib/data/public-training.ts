import "server-only";

import { prisma } from "@/lib/prisma";
import { readPublicData } from "@/lib/public-data";
import { mapPublicTrainingProgram } from "@/lib/data/public-content-mappers";

export async function getPublicTrainingPrograms() {
  const records = await readPublicData(
    "published VTIME programmes",
    () => prisma.trainingProgram.findMany({
      where: { published: true },
      orderBy: [{ startDate: "asc" }, { title: "asc" }],
    }),
    [],
  );

  return records.map(mapPublicTrainingProgram);
}

export async function getPublicTrainingProgramBySlug(slug: string) {
  const record = await readPublicData(
    "published VTIME programme",
    () => prisma.trainingProgram.findFirst({ where: { slug, published: true } }),
    null,
  );

  return record ? mapPublicTrainingProgram(record) : null;
}
