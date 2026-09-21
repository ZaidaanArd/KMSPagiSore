import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { AlertTriangle, FileQuestion, RotateCcw } from "lucide-react";
import type { KnowledgeStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function DisplayHeading({
  before,
  accent,
  after,
  className,
}: {
  before: string;
  accent: string;
  after?: string;
  className?: string;
}) {
  return (
    <h1 className={cn("max-w-[780px] font-display text-[clamp(2.55rem,4.1vw,3.625rem)] font-medium leading-[1.05] tracking-[-2.2px] text-foreground", className)}>
      {before} <span className="font-semibold text-accent">{accent}</span>{after}
    </h1>
  );
}

const statusMap: Record<KnowledgeStatus, { label: string; style: string }> = {
  active: { label: "AKTIF", style: "border-[#166534] bg-[#123b29] text-success" },
  review: { label: "MENUNGGU REVIEW", style: "border-[#675b24] bg-[#3a3315] text-warning" },
  draft: { label: "DRAF", style: "border-border bg-surface-muted text-muted" },
  needs_revision: { label: "PERLU REVISI", style: "border-[#7f3035] bg-[#3b1b1e] text-destructive" },
  expired: { label: "KEDALUWARSA", style: "border-[#7f3035] bg-[#3b1b1e] text-destructive" },
  archived: { label: "ARSIP", style: "border-border bg-surface-muted text-muted" },
};

export function StatusBadge({ status, label, className }: { status: KnowledgeStatus; label?: string; className?: string }) {
  const config = statusMap[status];
  return (
    <span className={cn("inline-flex min-h-7 items-center rounded-md border px-3 text-[10px] font-bold tracking-[.7px]", config.style, className)}>
      {label ?? config.label}
    </span>
  );
}

export function SurfaceCard({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("surface-card", className)} {...props} />;
}

export function PageIntro({
  before,
  accent,
  description,
  children,
  compact,
}: {
  before: string;
  accent: string;
  description: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <header className={cn("pt-8 md:pt-9", compact ? "pb-8" : "pb-12 md:pb-14")}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <DisplayHeading before={before} accent={accent} />
          <p className="mt-5 max-w-[760px] text-[15px] leading-7 text-muted md:text-[17px]">{description}</p>
        </div>
        {children}
      </div>
    </header>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <SurfaceCard className="flex min-h-60 flex-col items-center justify-center px-6 py-12 text-center">
      <FileQuestion className="text-accent" size={30} aria-hidden="true" />
      <h2 className="mt-4 font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </SurfaceCard>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <SurfaceCard className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center" role="alert">
      <AlertTriangle className="text-destructive" size={32} aria-hidden="true" />
      <h2 className="mt-4 font-display text-2xl font-semibold">Data belum dapat dimuat</h2>
      <p className="mt-2 max-w-lg text-sm leading-6 text-muted">{message}</p>
      <Button className="mt-5" onClick={onRetry}><RotateCcw size={16} /> Coba lagi</Button>
    </SurfaceCard>
  );
}

export function LoadingBlocks({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-label="Memuat data" role="status">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="surface-card h-24 animate-pulse bg-[#202024]" />
      ))}
      <span className="sr-only">Sedang memuat data pengetahuan.</span>
    </div>
  );
}

export function LinkButton({
  href,
  children,
  variant = "secondary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-bold transition hover:-translate-y-px",
        variant === "primary"
          ? "border-primary bg-primary text-primary-foreground hover:bg-[#04733a]"
          : "border-border bg-surface-muted text-foreground hover:border-[#52525b] hover:bg-[#303034]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
