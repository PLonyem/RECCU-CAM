import type { LocalizedText } from "@/lib/i18n";

export type NewsCategory =
  | "network-news"
  | "projects"
  | "training-events"
  | "insights"
  | "Circular"
  | "Training"
  | "COBAC"
  | "Announcement"
  | "Event";

export const regions: string[] = [
  "ADAMAWA",
  "CENTRE",
  "EAST",
  "FAR NORTH",
  "LITTORAL",
  "NORTH",
  "NORTHWEST",
  "SOUTH",
  "SOUTHWEST",
  "WEST",
];

export const regionLabels: Record<string, LocalizedText> = {
  ADAMAWA: { en: "Adamawa", fr: "Adamaoua" },
  CENTRE: { en: "Centre", fr: "Centre" },
  EAST: { en: "East", fr: "Est" },
  "FAR NORTH": { en: "Far North", fr: "Extrême-Nord" },
  LITTORAL: { en: "Littoral", fr: "Littoral" },
  NORTH: { en: "North", fr: "Nord" },
  NORTHWEST: { en: "North-West", fr: "Nord-Ouest" },
  SOUTH: { en: "South", fr: "Sud" },
  SOUTHWEST: { en: "South-West", fr: "Sud-Ouest" },
  WEST: { en: "West", fr: "Ouest" },
};

export const CATEGORIES: { value: NewsCategory; label: LocalizedText; description: string }[] = [
  { value: "network-news", label: { en: "Network News", fr: "Actualités du réseau" }, description: "Approved network and affiliate updates" },
  { value: "projects", label: { en: "Projects", fr: "Projets" }, description: "Source-verified project updates" },
  { value: "training-events", label: { en: "Training & Events", fr: "Formation et événements" }, description: "Confirmed learning and event notices" },
  { value: "insights", label: { en: "Insights", fr: "Analyses" }, description: "Cooperative and financial education" },
  { value: "Circular", label: { en: "Circular", fr: "Circulaire" }, description: "Approved institutional circulars" },
  { value: "Training", label: { en: "Training", fr: "Formation" }, description: "Confirmed training notices" },
  { value: "COBAC", label: { en: "COBAC", fr: "COBAC" }, description: "Source-labelled regulatory information" },
  { value: "Announcement", label: { en: "Announcement", fr: "Annonce" }, description: "Institutional announcements" },
  { value: "Event", label: { en: "Event", fr: "Événement" }, description: "Confirmed events" },
];

export const CHAPTERS = ["Bamenda", "Bambili", "Santa", "Multiple"];
export const RESOURCE_CATEGORIES = ["ReportingTemplate", "RegulatorySource", "TrainingMaterial", "Form"];
