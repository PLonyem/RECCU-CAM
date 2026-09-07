import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { isAdminRole, normalizeAuthRole } from "@/lib/auth/roles";
import { adminDataResponse } from "@/lib/admin-data-server";
import { prisma } from "@/lib/prisma";
import { uniqueNewsSlug } from "@/lib/news-articles";
import { newsArticleDraftSchema, newsArticleSchema } from "@/lib/validation/news-article";
import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !isAdminRole(sessionClaims?.metadata?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 20));
  const search = params.get("search")?.trim();
  const category = params.get("category");
  const status = params.get("status");
  const language = params.get("language");

  const where: Prisma.NewsArticleWhereInput = {};

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }
  if (category) {
    where.category = category;
  }
  if (status === "published") {
    where.published = true;
  } else if (status === "draft") {
    where.published = false;
  }
  if (language) {
    where.language = language;
  }

  return adminDataResponse("news", "list", async () => {
    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.newsArticle.count({ where }),
    ]);

    return {
      articles,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  });
}

export async function POST(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  const role = normalizeAuthRole(sessionClaims?.metadata?.role);
  if (!userId || !role || !isAdminRole(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = (body && typeof body === "object" && "published" in body && body.published === true
    ? newsArticleSchema
    : newsArticleDraftSchema).safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Review the highlighted fields.", errors: parsed.error.flatten().fieldErrors, details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const slug = await uniqueNewsSlug(data.slug?.trim() || data.title);

  return adminDataResponse(
    "news",
    "create",
    async () => {
      const article = await prisma.newsArticle.create({
        data: {
          ...data,
          slug,
          publishedAt: data.published
            ? data.publishedAt
              ? new Date(data.publishedAt)
              : new Date()
            : null,
        },
      });
      await writeAuditLog({ actorId: userId, actorRole: role, action: "news_created", resource: "news_article", resourceId: article.id, metadata: { published: article.published } });
      revalidatePath("/news");
      revalidatePath(`/news/${article.slug}`);
      return article;
    },
    201,
  );
}
