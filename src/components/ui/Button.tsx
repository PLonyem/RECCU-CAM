import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-5 text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-base ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-safe:hover:-translate-y-px",
  {
    variants: {
      variant: {
        default: "bg-brand text-white shadow-sm hover:bg-institutional",
        secondary: "border border-border bg-surface text-foreground hover:border-primary-200 hover:bg-muted",
        outline: "border border-border bg-surface text-foreground hover:border-primary-200 hover:bg-muted",
        accent: "bg-gold text-gold-foreground shadow-sm hover:bg-gold-strong hover:text-white",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
        danger: "bg-error text-white hover:bg-red-800",
      },
      size: {
        default: "min-h-11 px-5 text-sm",
        lg: "min-h-12 px-6 text-base",
        sm: "min-h-9 px-3 text-xs",
        icon: "h-11 w-11 min-h-11 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size, variant, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    return (
      <Component
        ref={ref}
        className={cn(buttonVariants({ size, variant }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

type NamedButtonProps = Omit<ButtonProps, "variant">;

export const PrimaryButton = forwardRef<HTMLButtonElement, NamedButtonProps>((props, ref) => (
  <Button ref={ref} variant="default" {...props} />
));
PrimaryButton.displayName = "PrimaryButton";

export const SecondaryButton = forwardRef<HTMLButtonElement, NamedButtonProps>((props, ref) => (
  <Button ref={ref} variant="secondary" {...props} />
));
SecondaryButton.displayName = "SecondaryButton";

export const GhostButton = forwardRef<HTMLButtonElement, NamedButtonProps>((props, ref) => (
  <Button ref={ref} variant="ghost" {...props} />
));
GhostButton.displayName = "GhostButton";

export { Button, buttonVariants };
