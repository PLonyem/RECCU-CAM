ALTER TABLE "homepage_content"
ADD COLUMN "primaryColor" TEXT NOT NULL DEFAULT '#0D3D2E',
ADD COLUMN "secondaryColor" TEXT NOT NULL DEFAULT '#267A57',
ADD COLUMN "accentColor" TEXT NOT NULL DEFAULT '#C58B2A',
ADD COLUMN "surfaceColor" TEXT NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN "buttonColor" TEXT NOT NULL DEFAULT '#0D3D2E',
ADD COLUMN "buttonHoverColor" TEXT NOT NULL DEFAULT '#082D22',
ADD COLUMN "footerBackgroundColor" TEXT NOT NULL DEFAULT '#082D22';

ALTER TABLE "homepage_content"
ALTER COLUMN "overlayColor" SET DEFAULT '#0D3D2E',
ALTER COLUMN "overlayOpacity" SET DEFAULT 68,
ALTER COLUMN "backgroundColor" SET DEFAULT '#124C37';

UPDATE "homepage_content"
SET
  "overlayColor" = CASE WHEN "overlayColor" IN ('#000000', '#0A2647', '#144272', '#205295') THEN '#0D3D2E' ELSE "overlayColor" END,
  "overlayOpacity" = CASE WHEN "overlayOpacity" = 40 THEN 68 ELSE "overlayOpacity" END,
  "backgroundColor" = CASE WHEN "backgroundColor" IN ('#0A2647', '#144272', '#205295') THEN '#124C37' ELSE "backgroundColor" END;
