-- Extend public correspondence into an auditable institutional inbox.
-- Existing messages receive stable references based on creation order.
ALTER TABLE "contact_messages"
  ADD COLUMN "referenceNumber" TEXT,
  ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'normal',
  ADD COLUMN "priorityRank" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "readAt" TIMESTAMP(3),
  ADD COLUMN "assignedUserId" TEXT,
  ADD COLUMN "respondedAt" TIMESTAMP(3),
  ADD COLUMN "respondedBy" TEXT,
  ADD COLUMN "responseMethod" TEXT,
  ADD COLUMN "responseNote" TEXT,
  ADD COLUMN "responseDueAt" TIMESTAMP(3),
  ADD COLUMN "archivedAt" TIMESTAMP(3);

UPDATE "contact_messages"
SET
  "status" = CASE WHEN "status" = 'closed' THEN 'resolved' ELSE "status" END,
  "readAt" = CASE WHEN "isRead" THEN "updatedAt" ELSE NULL END;

WITH numbered AS (
  SELECT
    "id",
    EXTRACT(YEAR FROM "createdAt" AT TIME ZONE 'UTC')::INTEGER AS year,
    ROW_NUMBER() OVER (
      PARTITION BY EXTRACT(YEAR FROM "createdAt" AT TIME ZONE 'UTC')
      ORDER BY "createdAt", "id"
    ) AS sequence
  FROM "contact_messages"
)
UPDATE "contact_messages" AS message
SET "referenceNumber" = 'RECCU-MSG-' || numbered.year || '-' || LPAD(numbered.sequence::TEXT, 6, '0')
FROM numbered
WHERE message."id" = numbered."id";

ALTER TABLE "contact_messages" ALTER COLUMN "referenceNumber" SET NOT NULL;

CREATE UNIQUE INDEX "contact_messages_referenceNumber_key" ON "contact_messages"("referenceNumber");
CREATE INDEX "contact_messages_priority_idx" ON "contact_messages"("priority");
CREATE INDEX "contact_messages_priorityRank_createdAt_idx" ON "contact_messages"("priorityRank", "createdAt");
CREATE INDEX "contact_messages_isRead_archivedAt_idx" ON "contact_messages"("isRead", "archivedAt");
CREATE INDEX "contact_messages_assignedUserId_archivedAt_idx" ON "contact_messages"("assignedUserId", "archivedAt");
CREATE INDEX "contact_messages_responseDueAt_idx" ON "contact_messages"("responseDueAt");
CREATE INDEX "contact_messages_updatedAt_idx" ON "contact_messages"("updatedAt");

CREATE TABLE "message_reference_counters" (
  "year" INTEGER NOT NULL,
  "sequence" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "message_reference_counters_pkey" PRIMARY KEY ("year")
);

INSERT INTO "message_reference_counters" ("year", "sequence", "updatedAt")
SELECT
  EXTRACT(YEAR FROM "createdAt" AT TIME ZONE 'UTC')::INTEGER,
  COUNT(*)::INTEGER,
  CURRENT_TIMESTAMP
FROM "contact_messages"
GROUP BY EXTRACT(YEAR FROM "createdAt" AT TIME ZONE 'UTC');

CREATE TABLE "message_notes" (
  "id" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "authorUserId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "message_notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "message_notes_messageId_createdAt_idx" ON "message_notes"("messageId", "createdAt");

-- Preserve notes created by the earlier JSON-backed operational queue.
INSERT INTO "message_notes" ("id", "messageId", "authorUserId", "body", "createdAt")
SELECT
  'legacy_' || MD5(message."id" || ':' || note.ordinality::TEXT),
  message."id",
  COALESCE(NULLIF(note.value->>'actorId', ''), 'legacy-import'),
  note.value->>'note',
  CASE
    WHEN note.value->>'createdAt' ~ '^\d{4}-\d{2}-\d{2}T'
      THEN (note.value->>'createdAt')::TIMESTAMPTZ
    ELSE message."updatedAt"
  END
FROM "contact_messages" AS message
CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS(
  CASE WHEN JSONB_TYPEOF(message."internalNotes") = 'array'
    THEN message."internalNotes"
    ELSE '[]'::JSONB
  END
) WITH ORDINALITY AS note(value, ordinality)
WHERE NULLIF(note.value->>'note', '') IS NOT NULL;

ALTER TABLE "message_notes"
  ADD CONSTRAINT "message_notes_messageId_fkey"
  FOREIGN KEY ("messageId") REFERENCES "contact_messages"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
