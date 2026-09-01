export interface TrainingProgram {
  slug: string;
  title: string;
  audience: string;
  format: string;
  summary: string;
  modules: string[];
}

export const trainingPrograms: TrainingProgram[] = [
  {
    slug: "cooperative-governance-foundations",
    title: "Cooperative Governance Foundations",
    audience: "Boards, supervisory committees, and managers",
    format: "Programme preview — delivery details pending",
    summary:
      "A practical learning pathway covering member ownership, clear oversight, accountable decisions, and effective board-management relationships.",
    modules: ["Cooperative identity", "Roles and accountability", "Meeting discipline"],
  },
  {
    slug: "responsible-credit-practice",
    title: "Responsible Credit Practice",
    audience: "Credit, operations, and member-service teams",
    format: "Programme preview — delivery details pending",
    summary:
      "A member-centred introduction to consistent assessment, clear communication, portfolio monitoring, and fair treatment.",
    modules: ["Member needs", "Assessment workflow", "Portfolio follow-up"],
  },
  {
    slug: "digital-operations-readiness",
    title: "Digital Operations Readiness",
    audience: "Managers, operations teams, and digital champions",
    format: "Programme preview — delivery details pending",
    summary:
      "Prepare teams for secure, accessible digital services through process mapping, data stewardship, and change management.",
    modules: ["Process mapping", "Data responsibility", "Adoption planning"],
  },
];

export const publishedTrainingEvents: [] = [];
