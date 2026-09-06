import { prisma } from "@/lib/prisma";
import { MediaLibraryClient } from "@/components/admin/MediaLibraryClient";

export default async function MediaLibraryPage() {
  const media = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
  return <MediaLibraryClient initialAssets={media.map((asset) => ({ ...asset, createdAt: asset.createdAt.toISOString() }))} />;
}
