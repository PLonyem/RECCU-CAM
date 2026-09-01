import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { networkAffiliates } from "../src/data/affiliates";
import { institution } from "../src/config/institution";

async function seedInstitutionDefaults() {
  await prisma.homepageContent.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      heroBadge: institution.displayName,
      heroTitle: "Cooperation that moves communities forward.",
      heroSubtitle: institution.platformStatement,
      primaryButtonText: "Explore the network",
      primaryButtonLink: "/network/affiliates",
      secondaryButtonText: "Discover VTIME",
      secondaryButtonLink: "/vtime",
      showStats: false,
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: institution.brandName,
      fullName: institution.legalName,
      address: `${institution.location.city}, ${institution.location.country}`,
      addressSecondary: "",
      phone: "",
      email: "",
      officeHours: "",
      facebookUrl: "",
    },
  });

  await prisma.notificationSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", adminNotificationEmail: "" },
  });

  await prisma.adminSecuritySettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
}

async function seedVerifiedDirectory() {
  const region = await prisma.region.upsert({
    where: { name: "North-West Region" },
    update: {},
    create: { name: "North-West Region" },
  });

  const chapter = await prisma.chapter.upsert({
    where: {
      name_regionId: { name: "Published directory", regionId: region.id },
    },
    update: {},
    create: { name: "Published directory", regionId: region.id },
  });

  for (const affiliate of networkAffiliates) {
    await prisma.affiliate.upsert({
      where: { code: affiliate.code },
      update: {
        name: affiliate.name,
        region: affiliate.region,
        city: affiliate.city,
        chapterId: chapter.id,
      },
      create: {
        code: affiliate.code,
        name: affiliate.name,
        region: affiliate.region,
        city: affiliate.city,
        chapterId: chapter.id,
        profileStatus: "pending",
      },
    });
  }
}

async function main() {
  await seedInstitutionDefaults();
  await seedVerifiedDirectory();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
