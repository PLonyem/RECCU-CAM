import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { affiliates, newsArticles, resources } from "../src/lib/mock-data";
import { CAMCCUL_REGION_STRUCTURE } from "../src/lib/chapters";

async function seedAdminUser() {
  const passwordHash = await bcrypt.hash("admin123", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@camccul.cm" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@camccul.cm",
      passwordHash,
      role: "admin",
    },
  });
  console.log("Admin user seeded");
}

async function seedNewsArticles() {
  for (const article of newsArticles) {
    await prisma.newsArticle.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        title: article.title,
        slug: article.slug,
        language: article.language,
        category: article.category,
        tags: article.tags,
        excerpt: article.excerpt,
        content: article.content,
        authorName: article.author.name,
        authorRole: article.author.role || null,
        chapter: article.chapter || null,
        featured: article.featured,
        published: true,
        publishedAt: new Date(article.publishedAt),
        heroImageUrl: article.heroImage.url || null,
        heroImageAlt: article.heroImage.alt || null,
        heroImageCaption: article.heroImage.caption || null,
      },
    });
  }
  console.log(`${newsArticles.length} news articles seeded`);
}

async function seedRegionsAndChapters() {
  const chaptersByRegionCode = new Map<string, Array<{ id: string; name: string }>>();

  for (const regionDefinition of CAMCCUL_REGION_STRUCTURE) {
    const region = await prisma.region.upsert({
      where: { name: regionDefinition.name },
      update: {},
      create: { name: regionDefinition.name },
    });

    const chapters = [];
    for (const chapterName of regionDefinition.chapters) {
      const chapter = await prisma.chapter.upsert({
        where: { name_regionId: { name: chapterName, regionId: region.id } },
        update: {},
        create: { name: chapterName, regionId: region.id },
      });
      chapters.push(chapter);
    }
    chaptersByRegionCode.set(regionDefinition.code, chapters);
  }

  console.log("5 regions and 10 chapters seeded");
  return chaptersByRegionCode;
}

async function seedAffiliates(chaptersByRegionCode: Map<string, Array<{ id: string; name: string }>>) {
  for (const affiliate of affiliates) {
    const regionChapters = chaptersByRegionCode.get(affiliate.region.toUpperCase()) ?? [];
    const numericCode = Number.parseInt(affiliate.code.match(/\d+/)?.[0] ?? "0", 10);
    const assignedChapter = regionChapters.length > 0
      ? regionChapters[numericCode % regionChapters.length]
      : null;

    await prisma.affiliate.upsert({
      where: { code: affiliate.code },
      update: assignedChapter
        ? { chapterId: assignedChapter.id, chapterName: assignedChapter.name }
        : {},
      create: {
        code: affiliate.code,
        name: affiliate.name,
        region: affiliate.region,
        chapterId: assignedChapter?.id ?? null,
        chapterName: assignedChapter?.name ?? null,
        city: affiliate.city || null,
        address: affiliate.address || null,
        phone: affiliate.phone || null,
        email: affiliate.email || null,
        isActive: affiliate.isActive,
      },
    });
  }
  console.log(`${affiliates.length} affiliates seeded`);
}

async function seedResources() {
  for (const resource of resources) {
    await prisma.resource.upsert({
      where: { id: resource.id },
      update: {},
      create: {
        id: resource.id,
        title: resource.title.en,
        description: resource.description.en,
        category: resource.category,
        fileType: resource.fileType,
        fileSize: resource.fileSize,
        downloadCount: resource.downloadCount,
        fileUrl: resource.fileUrl || null,
      },
    });
  }
  console.log(`${resources.length} resources seeded`);
}

async function seedContactMessages() {
  const sampleMessages = [
    {
      id: "contact-msg-1",
      name: "Jane Doe",
      email: "jane.doe@example.com",
      subject: "Question about opening a savings account",
      message:
        "Hello, I'd like to know the requirements for opening a savings account through one of your affiliate credit unions in the Northwest region. Thank you.",
    },
    {
      id: "contact-msg-2",
      name: "John Smith",
      email: "john.smith@example.com",
      subject: "Loan application inquiry",
      message:
        "Good day, I submitted a loan application through my local credit union two weeks ago and haven't heard back. Could someone advise on the typical processing time?",
    },
    {
      id: "contact-msg-3",
      name: "Grace Mbah",
      email: "grace.mbah@example.com",
      subject: "Partnership proposal",
      message:
        "Hello CamCCUL team, I represent a local NGO interested in exploring a financial literacy partnership with your network. Please let me know who I should speak with.",
    },
  ];

  for (const sample of sampleMessages) {
    await prisma.contactMessage.upsert({
      where: { id: sample.id },
      update: {},
      create: sample,
    });
  }
  console.log(`${sampleMessages.length} sample contact messages seeded`);
}

async function seedAnnouncements() {
  const now = new Date();
  const sampleAnnouncements = [
    {
      id: "announcement-1",
      title: "Q3 Reporting Deadline",
      opening:
        "Dear Colleagues, This is to remind all credit unions of the upcoming Q3 reporting obligations. Please note the following:",
      details: [
        { label: "Reporting Period", value: "July – September 2026" },
        { label: "Submission Deadline", value: "September 30, 2026" },
        {
          label: "Required Documents",
          value: "Financial statements, loan portfolio report, liquidity ratio calculation",
        },
        { label: "Submission Method", value: "Via the CamCCUL online portal" },
      ],
      category: "Circular",
      priority: "urgent",
      isPublished: true,
      publishedAt: now,
    },
    {
      id: "announcement-2",
      title: "Digital Training Session",
      opening:
        "CamCCUL is hosting a digital banking training session for credit union staff, covering mobile banking platforms, digital security, and member onboarding best practices. Contact your regional chapter for scheduling details.",
      details: [],
      category: "Training",
      priority: "normal",
      isPublished: true,
      publishedAt: now,
    },
    {
      id: "announcement-3",
      title: "New COBAC Guidelines",
      opening:
        "COBAC has issued updated regulatory guidelines affecting reporting requirements for cooperative credit unions. All affiliates should review the new guidelines and ensure compliance with the revised standards.",
      details: [],
      category: "COBAC",
      priority: "urgent",
      isPublished: true,
      publishedAt: now,
    },
    {
      id: "announcement-4",
      title: "Profile Update Reminder",
      opening:
        "Credit unions that have not yet updated their profile information are reminded to complete their submission through the credit union dashboard. An up-to-date profile ensures accurate information is displayed to the public.",
      details: [],
      category: "Announcement",
      priority: "normal",
      isPublished: false,
    },
    {
      id: "announcement-5",
      title: "TrustSoft Training Seminar",
      opening:
        "Dear Colleagues, We are pleased to announce an upcoming hands-on training seminar facilitated by TrustSoft, scheduled to hold as follows:",
      details: [
        { label: "Date", value: "Thursday, September 12, 2026" },
        { label: "Venue", value: "CamCCUL Conference Hall, Bamenda" },
        { label: "Time", value: "9:00 AM – 4:00 PM" },
        { label: "Facilitator", value: "TrustSoft" },
        { label: "Topic", value: "Digital Reporting Tools" },
        { label: "Registration Deadline", value: "September 5, 2026" },
      ],
      category: "Training",
      priority: "high",
      isPublished: true,
      publishedAt: now,
    },
  ];

  for (const sample of sampleAnnouncements) {
    const { id, ...data } = sample;
    await prisma.announcement.upsert({
      where: { id },
      update: {},
      create: { id, ...data },
    });
  }
  console.log(`${sampleAnnouncements.length} announcements seeded`);
}

// HomepageContent, SiteSettings, and NotificationSettings each have no
// natural unique business key (no email/slug/code) since they're meant to
// exist as a single row — "default" is a fixed, well-known id so this stays
// idempotent and the app has a predictable id to query later, same idea as
// seedContactMessages' fixed sample ids above.
async function seedHomepageContent() {
  await prisma.homepageContent.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  console.log("Homepage content seeded");
}

async function seedSiteSettings() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  console.log("Site settings seeded");
}

async function seedNotificationSettings() {
  await prisma.notificationSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  console.log("Notification settings seeded");
}

async function main() {
  await seedAdminUser();
  await seedNewsArticles();
  const chaptersByRegionCode = await seedRegionsAndChapters();
  await seedAffiliates(chaptersByRegionCode);
  await seedResources();
  await seedContactMessages();
  await seedAnnouncements();
  await seedHomepageContent();
  await seedSiteSettings();
  await seedNotificationSettings();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
