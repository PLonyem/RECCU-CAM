export interface HomepageSectionsContent {
  whoTitle: string; whoDescription: string; missionTitle: string; missionBody: string;
  visionTitle: string; visionBody: string; values: { title: string; description: string }[];
  leaderName: string; leaderRole: string; leaderMessage: string;
  contactTitle: string; contactDescription: string; contactButtonText: string;
}

export const defaultHomepageSections: HomepageSectionsContent = {
  whoTitle: "An apex institution with a cooperative purpose.",
  whoDescription: "RECCU-CAM is an apex cooperative financial network that supports cooperative financial institutions and the communities they serve.",
  missionTitle: "Strengthening the conditions for cooperative finance to endure.",
  missionBody: "To foster resilient, well-governed, and professional cooperative institutions that can grow responsibly and contribute to financial inclusion.",
  visionTitle: "Shared strength matters in cooperative finance.",
  visionBody: "RECCU-CAM exists to help cooperative institutions move forward with greater confidence, shared purpose, and long-term perspective.",
  values: [
    { title: "Integrity", description: "Acting with honesty, consistency, and respect for the trust placed in cooperative institutions." },
    { title: "Accountability", description: "Encouraging clear responsibility, sound oversight, and decisions that can stand up to scrutiny." },
    { title: "Cooperation", description: "Advancing shared progress through collective purpose and enduring institutional relationships." },
    { title: "Professionalism", description: "Promoting disciplined practice, capable leadership, and high standards across institutional life." },
    { title: "Inclusion", description: "Keeping people, participation, and wider access to responsible finance at the centre of progress." },
  ],
  leaderName: "", leaderRole: "", leaderMessage: "",
  contactTitle: "Stronger Institutions Start With Stronger Cooperation.",
  contactDescription: "Connect with RECCU-CAM or continue exploring the institution's identity, purpose, and cooperative foundation.",
  contactButtonText: "Contact RECCU-CAM",
};

export function parseHomepageSections(value: unknown): HomepageSectionsContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaultHomepageSections;
  const candidate = value as Partial<HomepageSectionsContent>;
  return { ...defaultHomepageSections, ...candidate, values: Array.isArray(candidate.values) ? candidate.values.filter((item): item is { title: string; description: string } => Boolean(item && typeof item.title === "string" && typeof item.description === "string")) : defaultHomepageSections.values };
}
