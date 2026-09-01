import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const formControlClassName =
  "mt-2 min-h-12 w-full rounded-control border border-border bg-surface px-4 text-base text-foreground outline-none transition-[border-color,box-shadow] duration-fast placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground aria-[invalid=true]:border-error aria-[invalid=true]:focus:ring-error/20";

export function RequiredMark() {
  return (
    <span className="ml-1 text-error" aria-hidden="true">
      *
    </span>
  );
}

export function RequiredFieldsNote() {
  return (
    <p className="text-sm text-muted-foreground">
      Fields marked <span className="font-semibold text-error" aria-hidden="true">*</span>{" "}
      are required.
    </p>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm font-medium text-error" role="alert">
      {message}
    </p>
  );
}

interface FormNoticeProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title: string;
  variant: "error" | "success";
}

export const FormNotice = forwardRef<HTMLDivElement, FormNoticeProps>(
  ({ children, className, title, variant, ...props }, ref) => {
    const Icon = variant === "success" ? CheckCircle2 : AlertTriangle;
    return (
      <div
        ref={ref}
        role={variant === "success" ? "status" : "alert"}
        tabIndex={-1}
        className={cn(
          "rounded-panel border p-6 outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2",
          variant === "success"
            ? "border-success/20 bg-success-subtle"
            : "border-error/20 bg-error-subtle",
          className,
        )}
        {...props}
      >
        <div className="flex gap-4">
          <Icon
            className={cn("mt-0.5 h-6 w-6 shrink-0", variant === "success" ? "text-success" : "text-error")}
            aria-hidden="true"
          />
          <div>
            <h2 className={cn("font-display text-h4", variant === "success" ? "text-institutional" : "text-error")}>{title}</h2>
            <div className="mt-2 text-body text-foreground">{children}</div>
          </div>
        </div>
      </div>
    );
  },
);
FormNotice.displayName = "FormNotice";
