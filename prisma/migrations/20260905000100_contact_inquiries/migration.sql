-- Expand contact messages into routable institutional inquiries while
-- preserving every existing message record.
ALTER TABLE "contact_messages"
  ALTER COLUMN "email" DROP NOT NULL,
  ADD COLUMN "organization" TEXT,
  ADD COLUMN "role" TEXT,
  ADD COLUMN "purpose" TEXT NOT NULL DEFAULT 'general-inquiry',
  ADD COLUMN "department" TEXT NOT NULL DEFAULT 'Administration / Front Office',
  ADD COLUMN "consent" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'new',
  ADD COLUMN "updatedAt" TIMESTAMP(3);

UPDATE "contact_messages"
SET "updatedAt" = "createdAt"
WHERE "updatedAt" IS NULL;

ALTER TABLE "contact_messages"
  ALTER COLUMN "updatedAt" SET NOT NULL;

CREATE INDEX "contact_messages_purpose_idx" ON "contact_messages"("purpose");
CREATE INDEX "contact_messages_status_idx" ON "contact_messages"("status");
CREATE INDEX "contact_messages_createdAt_idx" ON "contact_messages"("createdAt");
