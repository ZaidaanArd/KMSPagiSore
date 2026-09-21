import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "default" | "sm" | "icon";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "secondary", size = "default", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-bold transition hover:-translate-y-px active:translate-y-0 disabled:transform-none",
        variant === "primary" && "border-primary bg-primary text-primary-foreground hover:bg-[#04733a]",
        variant === "secondary" && "border-border bg-surface-muted text-foreground hover:border-[#52525b] hover:bg-[#303034]",
        variant === "ghost" && "border-transparent bg-transparent text-muted hover:bg-surface-muted hover:text-foreground",
        variant === "danger" && "border-[#7f3035] bg-[#3b1b1e] text-destructive hover:bg-[#4b2226]",
        size === "sm" && "min-h-9 px-3 text-xs",
        size === "icon" && "h-11 w-11 p-0",
        className,
      )}
      {...props}
    />
  );
});
