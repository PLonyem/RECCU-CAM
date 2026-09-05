ALTER TABLE "homepage_content"
  ADD COLUMN "draftContent" JSONB,
  ADD COLUMN "publicationStatus" TEXT NOT NULL DEFAULT 'published',
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "publishedBy" TEXT;
