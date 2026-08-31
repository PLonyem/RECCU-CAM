import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface AdminComingSoonProps {
  title: string;
  icon: LucideIcon;
  description: string;
}

// Shared placeholder for sidebar destinations added ahead of their real
// page — keeps the nav fully clickable (no 404s) while the actual feature
// is built out separately.
export function AdminComingSoon({ title, icon: Icon, description }: AdminComingSoonProps) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
      <Card className="p-8 text-center">
        <Icon className="h-8 w-8 text-primary-400 mx-auto mb-3" aria-hidden="true" />
        <p className="text-sm text-gray-500">{description}</p>
      </Card>
    </div>
  );
}
