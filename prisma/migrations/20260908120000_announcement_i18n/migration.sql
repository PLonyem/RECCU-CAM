ALTER TABLE "announcements"
ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';
