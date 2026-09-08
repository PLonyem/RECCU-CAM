ALTER TABLE "homepage_content"
ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "news_articles"
ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "training_programs"
ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "resources"
ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "compliance_records"
ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';
