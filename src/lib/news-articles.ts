import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function uniqueNewsSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let suffix = 2;

  while (
    await prisma.newsArticle.findFirst({
      where: excludeId ? { slug, NOT: { id: excludeId } } : { slug },
      select: { id: true },
    })
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}
