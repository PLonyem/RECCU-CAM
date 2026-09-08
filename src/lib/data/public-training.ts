import "server-only";

import { prisma } from "@/lib/prisma";
import { readPublicData } from "@/lib/public-data";
import { mapPublicTrainingProgram } from "@/lib/data/public-content-mappers";
import { getServerLanguage } from "@/lib/i18n-server";
import { localizeTrainingProgram } from "@/lib/localized-content";

export async function getPublicTrainingPrograms() {
  const language = await getServerLanguage();
  const records = await readPublicData(
    "published VTIME programmes",
    () => prisma.trainingProgram.findMany({
      where: { published: true },
      orderBy: [{ startDate: "asc" }, { title: "asc" }],
    }),
    [],
  );

  return records.map((record) => mapPublicTrainingProgram(localizeTrainingProgram(record, language)));
}

export async function getPublicTrainingProgramBySlug(slug: string) {
  const language = await getServerLanguage();
  const record = await readPublicData(
    "published VTIME programme",
    () => prisma.trainingProgram.findFirst({ where: { slug, published: true } }),
    null,
  );

  return record ? mapPublicTrainingProgram(localizeTrainingProgram(record, language)) : null;
}
