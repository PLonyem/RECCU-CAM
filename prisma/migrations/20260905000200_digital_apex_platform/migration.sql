ALTER TABLE "affiliates"
  ADD COLUMN "logoUrl" TEXT,
  ADD COLUMN "description" TEXT;

ALTER TABLE "contact_messages"
  ADD COLUMN "assignedTo" TEXT,
  ADD COLUMN "internalNotes" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "resources"
  ADD COLUMN "issuingAuthority" TEXT,
  ADD COLUMN "publicationDate" TIMESTAMP(3),
  ADD COLUMN "accessLevel" TEXT NOT NULL DEFAULT 'PUBLIC',
  ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "archivedAt" TIMESTAMP(3);

ALTER TABLE "announcements"
  ADD COLUMN "audience" TEXT NOT NULL DEFAULT 'PUBLIC',
  ADD COLUMN "affiliateId" TEXT,
  ADD COLUMN "startDate" TIMESTAMP(3);

CREATE TABLE "affiliate_update_requests" (
  "id" TEXT NOT NULL,
  "affiliateId" TEXT NOT NULL,
  "submittedBy" TEXT NOT NULL,
  "requestedData" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "reviewNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "affiliate_update_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_tickets" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "affiliateId" TEXT NOT NULL,
  "submittedBy" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "priority" TEXT NOT NULL DEFAULT 'normal',
  "status" TEXT NOT NULL DEFAULT 'open',
  "assignedTo" TEXT,
  "response" TEXT,
  "internalNotes" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "affiliate_banking_inquiries" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "affiliateId" TEXT,
  "institution" TEXT NOT NULL,
  "contactPerson" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "supportCategory" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'submitted',
  "assignedTo" TEXT,
  "internalNotes" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "affiliate_banking_inquiries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "affiliation_inquiries" (
  "id" TEXT NOT NULL,
  "institution" TEXT NOT NULL,
  "contactPerson" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'new',
  "assignedTo" TEXT,
  "internalNotes" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "affiliation_inquiries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "training_programs" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "audience" TEXT[],
  "level" TEXT NOT NULL,
  "format" TEXT,
  "venue" TEXT,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "capacity" INTEGER,
  "registrationStatus" TEXT NOT NULL DEFAULT 'schedule-pending',
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "training_programs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "training_registrations" (
  "id" TEXT NOT NULL,
  "programId" TEXT NOT NULL,
  "affiliateId" TEXT,
  "participantName" TEXT NOT NULL,
  "institution" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'submitted',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "training_registrations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "compliance_records" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'pending',
  "audience" TEXT NOT NULL DEFAULT 'all-affiliates',
  "affiliateId" TEXT,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "compliance_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "page_content" (
  "id" TEXT NOT NULL,
  "pageKey" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'en',
  "status" TEXT NOT NULL DEFAULT 'draft',
  "content" JSONB NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "publishedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "page_content_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "media_assets" (
  "id" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT,
  "fileType" TEXT NOT NULL,
  "fileSize" INTEGER,
  "title" TEXT NOT NULL,
  "altText" TEXT NOT NULL,
  "caption" TEXT,
  "uploadedBy" TEXT NOT NULL,
  "storageState" TEXT NOT NULL DEFAULT 'metadata-only',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
  "id" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "actorRole" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "resourceId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "support_tickets_reference_key" ON "support_tickets"("reference");
CREATE UNIQUE INDEX "affiliate_banking_inquiries_reference_key" ON "affiliate_banking_inquiries"("reference");
CREATE UNIQUE INDEX "training_programs_slug_key" ON "training_programs"("slug");
CREATE UNIQUE INDEX "page_content_pageKey_locale_status_key" ON "page_content"("pageKey", "locale", "status");
CREATE INDEX "affiliate_update_requests_affiliateId_status_idx" ON "affiliate_update_requests"("affiliateId", "status");
CREATE INDEX "support_tickets_affiliateId_status_idx" ON "support_tickets"("affiliateId", "status");
CREATE INDEX "support_tickets_status_createdAt_idx" ON "support_tickets"("status", "createdAt");
CREATE INDEX "affiliate_banking_inquiries_affiliateId_status_idx" ON "affiliate_banking_inquiries"("affiliateId", "status");
CREATE INDEX "affiliate_banking_inquiries_status_createdAt_idx" ON "affiliate_banking_inquiries"("status", "createdAt");
CREATE INDEX "affiliation_inquiries_status_createdAt_idx" ON "affiliation_inquiries"("status", "createdAt");
CREATE INDEX "training_programs_published_startDate_idx" ON "training_programs"("published", "startDate");
CREATE INDEX "training_registrations_programId_status_idx" ON "training_registrations"("programId", "status");
CREATE INDEX "training_registrations_affiliateId_createdAt_idx" ON "training_registrations"("affiliateId", "createdAt");
CREATE INDEX "compliance_records_published_dueDate_idx" ON "compliance_records"("published", "dueDate");
CREATE INDEX "compliance_records_affiliateId_status_idx" ON "compliance_records"("affiliateId", "status");
CREATE INDEX "page_content_status_updatedAt_idx" ON "page_content"("status", "updatedAt");
CREATE INDEX "media_assets_createdAt_idx" ON "media_assets"("createdAt");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
CREATE INDEX "audit_logs_resource_resourceId_idx" ON "audit_logs"("resource", "resourceId");
CREATE INDEX "resources_accessLevel_published_idx" ON "resources"("accessLevel", "published");

ALTER TABLE "affiliate_update_requests" ADD CONSTRAINT "affiliate_update_requests_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "affiliate_banking_inquiries" ADD CONSTRAINT "affiliate_banking_inquiries_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "training_registrations" ADD CONSTRAINT "training_registrations_programId_fkey" FOREIGN KEY ("programId") REFERENCES "training_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "training_registrations" ADD CONSTRAINT "training_registrations_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
