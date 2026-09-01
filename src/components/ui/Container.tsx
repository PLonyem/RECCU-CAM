import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const widths = {
  default: "max-w-content",
  reading: "max-w-reading",
  full: "max-w-none",
} as const;

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof widths;
}

export function Container({ className, size = "default", ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-gutter", widths[size], className)}
      {...props}
    />
  );
}
