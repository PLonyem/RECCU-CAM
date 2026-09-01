-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT,
    "chapter" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "heroImageUrl" TEXT,
    "heroImageAlt" TEXT,
    "heroImageCaption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "chapter" TEXT,
    "chapterId" TEXT,
    "city" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "yearEstablished" INTEGER,
    "briefHistory" TEXT,
    "totalMembers" INTEGER,
    "branchCount" INTEGER,
    "memberCreditUnionCount" INTEGER,
    "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chapterPresident" TEXT,
    "chapterSupervisor" TEXT,
    "boardSize" INTEGER,
    "staffCount" INTEGER,
    "memberCreditUnions" JSONB,
    "profileUpdatedAt" TIMESTAMP(3),
    "profileStatus" TEXT DEFAULT 'pending',
    "profileReviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_products" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionFr" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'Landmark',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_product_versions" (
    "id" TEXT NOT NULL,
    "loanProductId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "minimumAmount" INTEGER NOT NULL,
    "maximumAmount" INTEGER NOT NULL,
    "availableTerms" INTEGER[],
    "interestRateBasisPoints" INTEGER NOT NULL,
    "interestPeriod" TEXT NOT NULL,
    "calculationMethod" TEXT NOT NULL,
    "requiredSavingsBasisPoints" INTEGER NOT NULL,
    "affordabilityBasisPoints" INTEGER,
    "gracePeriodMonths" INTEGER NOT NULL DEFAULT 0,
    "eligibilityDescriptionEn" TEXT,
    "eligibilityDescriptionFr" TEXT,
    "requiredDocuments" JSONB NOT NULL DEFAULT '[]',
    "feeRules" JSONB NOT NULL DEFAULT '[]',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "changeReason" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_product_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_product_affiliates" (
    "id" TEXT NOT NULL,
    "loanProductId" TEXT NOT NULL,
    "loanProductVersionId" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "minimumAmount" INTEGER,
    "maximumAmount" INTEGER,
    "availableTerms" INTEGER[],
    "interestRateBasisPoints" INTEGER,
    "interestPeriod" TEXT,
    "calculationMethod" TEXT,
    "requiredSavingsBasisPoints" INTEGER,
    "feeRules" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "changeReason" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_product_affiliates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_simulations" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "loanProductId" TEXT NOT NULL,
    "loanProductVersionId" TEXT NOT NULL,
    "affiliateId" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "requestedAmount" INTEGER NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "savingsBalance" INTEGER NOT NULL,
    "policySnapshot" JSONB NOT NULL,
    "inputSnapshot" JSONB NOT NULL,
    "resultSnapshot" JSONB NOT NULL,
    "eligibilityStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_policy_audit_logs" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previousData" JSONB,
    "newData" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_policy_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_submissions" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fieldSnapshot" JSONB,

    CONSTRAINT "affiliate_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_union_signup_requests" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "creditUnionName" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "affiliateId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_union_signup_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_documents" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_review',
    "extractedText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "fileUrl" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "opening" TEXT NOT NULL,
    "details" JSONB NOT NULL DEFAULT '[]',
    "category" TEXT NOT NULL DEFAULT 'Circular',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "targetChapter" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_content" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL DEFAULT 'Cooperation that moves communities forward.',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'One trusted digital home for RECCU-CAM network services, learning, knowledge, and cooperative connection.',
    "heroBadge" TEXT NOT NULL DEFAULT 'RECCU-CAM LTD',
    "primaryButtonText" TEXT NOT NULL DEFAULT 'Explore the network',
    "primaryButtonLink" TEXT NOT NULL DEFAULT '/network/affiliates',
    "secondaryButtonText" TEXT NOT NULL DEFAULT 'Discover VTIME',
    "secondaryButtonLink" TEXT NOT NULL DEFAULT '/vtime',
    "heroImages" JSONB NOT NULL DEFAULT '[]',
    "overlayColor" TEXT NOT NULL DEFAULT '#000000',
    "overlayOpacity" INTEGER NOT NULL DEFAULT 40,
    "backgroundColor" TEXT NOT NULL DEFAULT '#0A2647',
    "gradientDirection" TEXT NOT NULL DEFAULT 'to-br',
    "textAlignment" TEXT NOT NULL DEFAULT 'left',
    "buttonStyle" TEXT NOT NULL DEFAULT 'solid',
    "showOverlay" BOOLEAN NOT NULL DEFAULT true,
    "statsAffiliates" INTEGER NOT NULL DEFAULT 0,
    "statsMembers" TEXT NOT NULL DEFAULT '',
    "statsAssets" TEXT NOT NULL DEFAULT '',
    "showHero" BOOLEAN NOT NULL DEFAULT true,
    "showStats" BOOLEAN NOT NULL DEFAULT false,
    "showMission" BOOLEAN NOT NULL DEFAULT true,
    "showServices" BOOLEAN NOT NULL DEFAULT true,
    "showReach" BOOLEAN NOT NULL DEFAULT true,
    "showNews" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'RECCU-CAM',
    "fullName" TEXT NOT NULL DEFAULT 'Union of Renaissance Cooperative Credit Unions in Cameroon Ltd',
    "address" TEXT NOT NULL DEFAULT 'Bamenda, Cameroon',
    "addressSecondary" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "officeHours" TEXT NOT NULL DEFAULT '',
    "facebookUrl" TEXT NOT NULL DEFAULT '',
    "linkedinUrl" TEXT NOT NULL DEFAULT '',
    "twitterUrl" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "adminNotificationEmail" TEXT NOT NULL DEFAULT '',
    "newCreditUnionCreated" BOOLEAN NOT NULL DEFAULT true,
    "profileSubmittedForReview" BOOLEAN NOT NULL DEFAULT true,
    "profileUpdated" BOOLEAN NOT NULL DEFAULT false,
    "contactFormMessage" BOOLEAN NOT NULL DEFAULT true,
    "accountCredentialsEmail" BOOLEAN NOT NULL DEFAULT true,
    "profileSubmissionConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "profileApprovedEmail" BOOLEAN NOT NULL DEFAULT true,
    "profileRejectedEmail" BOOLEAN NOT NULL DEFAULT true,
    "emailTemplates" JSONB NOT NULL DEFAULT '{}',
    "enableEmails" BOOLEAN NOT NULL DEFAULT true,
    "enableProfileSubmissionEmail" BOOLEAN NOT NULL DEFAULT true,
    "enableProfileApprovalEmail" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_security_settings" (
    "id" TEXT NOT NULL,
    "minimumPasswordLength" INTEGER NOT NULL DEFAULT 8,
    "requireNumbers" BOOLEAN NOT NULL DEFAULT true,
    "requireSpecialCharacters" BOOLEAN NOT NULL DEFAULT false,
    "passwordExpiryDays" INTEGER NOT NULL DEFAULT 0,
    "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 60,
    "maximumFailedAttempts" INTEGER NOT NULL DEFAULT 5,
    "lockoutDurationMinutes" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_security_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_slug_key" ON "news_articles"("slug");

-- CreateIndex
CREATE INDEX "news_articles_category_idx" ON "news_articles"("category");

-- CreateIndex
CREATE INDEX "news_articles_published_idx" ON "news_articles"("published");

-- CreateIndex
CREATE INDEX "news_articles_publishedAt_idx" ON "news_articles"("publishedAt");

-- CreateIndex
CREATE INDEX "news_articles_language_idx" ON "news_articles"("language");

-- CreateIndex
CREATE UNIQUE INDEX "regions_name_key" ON "regions"("name");

-- CreateIndex
CREATE INDEX "chapters_regionId_idx" ON "chapters"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_name_regionId_key" ON "chapters"("name", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_code_key" ON "affiliates"("code");

-- CreateIndex
CREATE INDEX "affiliates_region_idx" ON "affiliates"("region");

-- CreateIndex
CREATE INDEX "affiliates_chapterId_idx" ON "affiliates"("chapterId");

-- CreateIndex
CREATE INDEX "affiliates_name_idx" ON "affiliates"("name");

-- CreateIndex
CREATE INDEX "affiliates_profileStatus_idx" ON "affiliates"("profileStatus");

-- CreateIndex
CREATE UNIQUE INDEX "loan_products_code_key" ON "loan_products"("code");

-- CreateIndex
CREATE INDEX "loan_products_category_idx" ON "loan_products"("category");

-- CreateIndex
CREATE INDEX "loan_products_isActive_idx" ON "loan_products"("isActive");

-- CreateIndex
CREATE INDEX "loan_product_versions_loanProductId_effectiveFrom_idx" ON "loan_product_versions"("loanProductId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "loan_product_versions_isPublished_effectiveFrom_idx" ON "loan_product_versions"("isPublished", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "loan_product_versions_loanProductId_version_key" ON "loan_product_versions"("loanProductId", "version");

-- CreateIndex
CREATE INDEX "loan_product_affiliates_affiliateId_isActive_idx" ON "loan_product_affiliates"("affiliateId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "loan_product_affiliates_loanProductVersionId_affiliateId_key" ON "loan_product_affiliates"("loanProductVersionId", "affiliateId");

-- CreateIndex
CREATE UNIQUE INDEX "loan_simulations_reference_key" ON "loan_simulations"("reference");

-- CreateIndex
CREATE INDEX "loan_simulations_createdAt_idx" ON "loan_simulations"("createdAt");

-- CreateIndex
CREATE INDEX "loan_simulations_loanProductId_createdAt_idx" ON "loan_simulations"("loanProductId", "createdAt");

-- CreateIndex
CREATE INDEX "loan_simulations_affiliateId_createdAt_idx" ON "loan_simulations"("affiliateId", "createdAt");

-- CreateIndex
CREATE INDEX "loan_policy_audit_logs_entityType_entityId_idx" ON "loan_policy_audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "loan_policy_audit_logs_createdAt_idx" ON "loan_policy_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "affiliate_submissions_affiliateId_idx" ON "affiliate_submissions"("affiliateId");

-- CreateIndex
CREATE UNIQUE INDEX "credit_union_signup_requests_email_key" ON "credit_union_signup_requests"("email");

-- CreateIndex
CREATE INDEX "credit_union_signup_requests_status_idx" ON "credit_union_signup_requests"("status");

-- CreateIndex
CREATE INDEX "credit_union_signup_requests_creditUnionName_idx" ON "credit_union_signup_requests"("creditUnionName");

-- CreateIndex
CREATE INDEX "affiliate_documents_affiliateId_idx" ON "affiliate_documents"("affiliateId");

-- CreateIndex
CREATE INDEX "resources_category_idx" ON "resources"("category");

-- CreateIndex
CREATE INDEX "announcements_isPublished_idx" ON "announcements"("isPublished");

-- CreateIndex
CREATE INDEX "announcements_publishedAt_idx" ON "announcements"("publishedAt");

-- CreateIndex
CREATE INDEX "announcements_category_idx" ON "announcements"("category");

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_product_versions" ADD CONSTRAINT "loan_product_versions_loanProductId_fkey" FOREIGN KEY ("loanProductId") REFERENCES "loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_product_affiliates" ADD CONSTRAINT "loan_product_affiliates_loanProductId_fkey" FOREIGN KEY ("loanProductId") REFERENCES "loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_product_affiliates" ADD CONSTRAINT "loan_product_affiliates_loanProductVersionId_fkey" FOREIGN KEY ("loanProductVersionId") REFERENCES "loan_product_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_product_affiliates" ADD CONSTRAINT "loan_product_affiliates_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_simulations" ADD CONSTRAINT "loan_simulations_loanProductId_fkey" FOREIGN KEY ("loanProductId") REFERENCES "loan_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_simulations" ADD CONSTRAINT "loan_simulations_loanProductVersionId_fkey" FOREIGN KEY ("loanProductVersionId") REFERENCES "loan_product_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_simulations" ADD CONSTRAINT "loan_simulations_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_submissions" ADD CONSTRAINT "affiliate_submissions_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_union_signup_requests" ADD CONSTRAINT "credit_union_signup_requests_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_documents" ADD CONSTRAINT "affiliate_documents_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
