import { z } from "zod";

const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a hex color like #0A2647");

// Content + Appearance tabs — Sections isn't built yet, so showHero/
// showStats/etc. are deliberately left out of this schema rather than
// accepted-but-ignored.
export const homepageContentSchema = z.object({
  // Content
  heroBadge: z.string().trim().min(1, "Badge text is required"),
  heroTitle: z.string().trim().min(1, "Headline is required"),
  heroSubtitle: z.string().trim().min(1, "Subtitle is required"),
  primaryButtonText: z.string().trim().min(1, "Primary button text is required"),
  primaryButtonLink: z
    .string()
    .trim()
    .min(1, "Primary button link is required")
    .refine((v) => v.startsWith("/"), "Link must start with /"),
  secondaryButtonText: z.string().trim().min(1, "Secondary button text is required"),
  secondaryButtonLink: z
    .string()
    .trim()
    .min(1, "Secondary button link is required")
    .refine((v) => v.startsWith("/"), "Link must start with /"),
  heroImages: z.array(z.string().url()).max(5, "Up to 5 images"),
  statsAffiliates: z.number().int().min(0),
  statsMembers: z.string().trim().min(1, "Members figure is required"),
  statsAssets: z.string().trim(),

  // Appearance
  showOverlay: z.boolean(),
  overlayColor: hexColor,
  overlayOpacity: z.number().int().min(0).max(100),
  backgroundColor: hexColor,
  gradientDirection: z.enum(["to-r", "to-b", "to-br", "to-bl"]),
  textAlignment: z.enum(["left", "center", "right"]),
  buttonStyle: z.enum(["solid", "outline", "ghost"]),

  // Sections — one flag per live homepage band. showServices is a
  // schema-column holdover from the original brief (which described a
  // "Services" section that doesn't exist on the actual page); repurposed
  // here to control the closing CTA band instead of leaving it unwired, so
  // every flag maps to something real rather than 5 working toggles and
  // one dead one.
  showHero: z.boolean(),
  showStats: z.boolean(),
  showMission: z.boolean(),
  showServices: z.boolean(),
  showReach: z.boolean(),
  showNews: z.boolean(),
});

export type HomepageContentInput = z.infer<typeof homepageContentSchema>;
