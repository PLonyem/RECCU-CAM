import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { uniqueNewsSlug } from "@/lib/news-articles";
import { updateNewsArticleSchema } from "@/lib/validation/news-article";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const article = await prisma.newsArticle.findUnique({ where: { id } });

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.newsArticle.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateNewsArticleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const slug =
    data.title && data.title !== existing.title
      ? await uniqueNewsSlug(data.title, id)
      : undefined;

  // Auto-stamp publishedAt only on the draft -> published transition; an
  // explicit publishedAt always wins, and unpublishing keeps the original
  // date rather than erasing when the article first went live.
  let publishedAt: Date | null | undefined;
  if (data.publishedAt !== undefined) {
    publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
  } else if (data.published === true && !existing.published) {
    publishedAt = new Date();
  }

  const article = await prisma.newsArticle.update({
    where: { id },
    data: {
      ...data,
      ...(slug ? { slug } : {}),
      ...(publishedAt !== undefined ? { publishedAt } : {}),
    },
  });

  return NextResponse.json(article);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.newsArticle.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.newsArticle.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
