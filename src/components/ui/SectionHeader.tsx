import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}

export function SectionHeader({
  title,
  subtitle,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div className={cn(align === "center" && "text-center")}>
      <h2 className="font-display text-3xl font-bold text-primary-900">
        {title}
      </h2>
      {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
    </div>
  );
}
