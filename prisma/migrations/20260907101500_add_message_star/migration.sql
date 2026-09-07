-- Add a durable star flag for the simplified institutional inbox.
ALTER TABLE "contact_messages"
ADD COLUMN "isStarred" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "contact_messages_isStarred_archivedAt_createdAt_idx"
ON "contact_messages"("isStarred", "archivedAt", "createdAt");
