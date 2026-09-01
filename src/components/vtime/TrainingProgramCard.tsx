import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  getTrainingCategory,
  trainingFormatLabels,
  trainingLevelLabels,
  type TrainingProgram,
} from "@/data/training-programs";

interface TrainingProgramCardProps {
  program: TrainingProgram;
  showModules?: boolean;
}

export function TrainingProgramCard({ program, showModules = false }: TrainingProgramCardProps) {
  const category = getTrainingCategory(program.category);

  return (
    <Card padding="default" className="flex h-full flex-col">
      <div className="flex flex-wrap gap-2">
        {category && <Badge variant="primary">{category.title}</Badge>}
        <Badge>{trainingLevelLabels[program.level]}</Badge>
        {program.format && <Badge>{trainingFormatLabels[program.format]}</Badge>}
      </div>
      <h3 className="mt-5 font-display text-h4 text-institutional">{program.title}</h3>
      <p className="mt-3 text-body text-muted-foreground">{program.summary}</p>
      <p className="mt-5 text-meta uppercase text-gold-strong">Designed for</p>
      <p className="mt-2 text-sm leading-6 text-foreground">{program.audience.join(", ")}</p>
      {showModules && (
        <div className="mt-5 border-t border-border pt-5">
          <p className="text-meta uppercase text-gold-strong">Core modules</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            {program.modules.map((module) => (
              <li key={module} className="flex gap-2">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-pill bg-forest" aria-hidden="true" />
                {module}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-auto pt-6">
        <Link
          href={`/vtime/programs#${program.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-forest underline-offset-4 transition-colors hover:text-institutional hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
        >
          View program outline <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
