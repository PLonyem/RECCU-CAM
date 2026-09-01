-- Rebrand known prototype defaults without overwriting independently edited values.
ALTER TABLE "homepage_content" ALTER COLUMN "heroTitle" SET DEFAULT 'Cooperation that moves communities forward.';
ALTER TABLE "homepage_content" ALTER COLUMN "heroSubtitle" SET DEFAULT 'One trusted digital home for RECCU-CAM network services, learning, knowledge, and cooperative connection.';
ALTER TABLE "homepage_content" ALTER COLUMN "heroBadge" SET DEFAULT 'RECCU-CAM LTD';
ALTER TABLE "homepage_content" ALTER COLUMN "primaryButtonLink" SET DEFAULT '/network/affiliates';
ALTER TABLE "homepage_content" ALTER COLUMN "secondaryButtonLink" SET DEFAULT '/vtime';
ALTER TABLE "homepage_content" ALTER COLUMN "statsAffiliates" SET DEFAULT 0;
ALTER TABLE "homepage_content" ALTER COLUMN "statsMembers" SET DEFAULT '';
ALTER TABLE "homepage_content" ALTER COLUMN "showStats" SET DEFAULT false;

UPDATE "homepage_content"
SET "heroTitle" = 'Cooperation that moves communities forward.',
    "heroSubtitle" = 'One trusted digital home for RECCU-CAM network services, learning, knowledge, and cooperative connection.',
    "heroBadge" = 'RECCU-CAM LTD',
    "primaryButtonText" = 'Explore the network',
    "primaryButtonLink" = '/network/affiliates',
    "secondaryButtonText" = 'Discover VTIME',
    "secondaryButtonLink" = '/vtime',
    "statsAffiliates" = 0,
    "statsMembers" = '',
    "statsAssets" = '',
    "showStats" = false
WHERE "heroBadge" = 'Cameroon Cooperative Credit Union League';

ALTER TABLE "site_settings" ALTER COLUMN "siteName" SET DEFAULT 'RECCU-CAM';
ALTER TABLE "site_settings" ALTER COLUMN "fullName" SET DEFAULT 'Union of Renaissance Cooperative Credit Unions in Cameroon Ltd';
ALTER TABLE "site_settings" ALTER COLUMN "address" SET DEFAULT 'Bamenda, Cameroon';
ALTER TABLE "site_settings" ALTER COLUMN "addressSecondary" SET DEFAULT '';
ALTER TABLE "site_settings" ALTER COLUMN "phone" SET DEFAULT '';
ALTER TABLE "site_settings" ALTER COLUMN "email" SET DEFAULT '';
ALTER TABLE "site_settings" ALTER COLUMN "officeHours" SET DEFAULT '';
ALTER TABLE "site_settings" ALTER COLUMN "facebookUrl" SET DEFAULT '';

UPDATE "site_settings"
SET "siteName" = 'RECCU-CAM',
    "fullName" = 'Union of Renaissance Cooperative Credit Unions in Cameroon Ltd',
    "address" = 'Bamenda, Cameroon',
    "addressSecondary" = '',
    "phone" = '',
    "email" = '',
    "officeHours" = '',
    "facebookUrl" = ''
WHERE "siteName" = 'CamCCUL';

ALTER TABLE "notification_settings" ALTER COLUMN "adminNotificationEmail" SET DEFAULT '';
UPDATE "notification_settings" SET "adminNotificationEmail" = '' WHERE "adminNotificationEmail" = 'info@camccul.cm';
