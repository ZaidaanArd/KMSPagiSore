"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flag, Home, Layers3, Search } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Toaster, toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tooltip from "@radix-ui/react-tooltip";
import { KmsProvider, useKms } from "@/lib/store/kms-store";
import { roleLabels } from "@/lib/permissions";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/dialogs";

const desktopNav = [
  { href: "/", label: "Beranda" },
  { href: "/knowledge", label: "Cari" },
  { href: "/promotions", label: "Promosi" },
  { href: "/review", label: "Review" },
];

const mobileNav = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/knowledge", label: "Cari", icon: Search },
  { href: "/knowledge/new", label: "Kelola", icon: Layers3 },
  { href: "/reports/new", label: "Laporan", icon: Flag },
];

function isActive(pathname: string, href: string, mobile = false) {
  if (href === "/") return pathname === "/";
  if (!mobile && href === "/review") {
    return pathname.startsWith("/review") || pathname === "/knowledge/new" || pathname.endsWith("/history");
  }
  if (!mobile && href === "/knowledge") {
    return (pathname.startsWith("/knowledge") && pathname !== "/knowledge/new" && !pathname.endsWith("/history")) || pathname.startsWith("/reports");
  }
  if (mobile && href === "/knowledge") {
    return pathname === "/knowledge" || (/^\/knowledge\/[^/]+$/.test(pathname) && pathname !== "/knowledge/new");
  }
  if (mobile && href === "/knowledge/new") {
    return pathname === "/knowledge/new" || pathname.startsWith("/review") || pathname.endsWith("/history");
  }
  if (mobile && href === "/reports/new") return pathname.startsWith("/reports");
  return pathname.startsWith(href);
}

function RoleMenu() {
  const { data, setRole, resetData } = useKms();
  const [resetOpen, setResetOpen] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="group flex min-h-11 items-center gap-3 rounded-lg px-2 text-right hover:bg-surface">
          <span className="hidden sm:block">
            <span className="block text-xs text-muted">{roleLabels[data.role]}</span>
          </span>
          <span className="grid h-[38px] w-[38px] place-items-center rounded-full bg-[#123b29] text-xs font-bold text-accent">PS</span>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="end" className="z-50 min-w-52 rounded-lg border border-border bg-surface p-1.5 shadow-2xl">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[1.3px] text-dim">Ubah peran</p>
            {(Object.keys(roleLabels) as Role[]).map((role) => (
              <DropdownMenu.Item key={role} onSelect={() => { setRole(role); toast.success(`Peran diubah ke ${roleLabels[role]}.`); }} className={cn("cursor-pointer rounded-md px-3 py-2.5 text-sm text-muted outline-none hover:bg-surface-muted hover:text-foreground", data.role === role && "bg-[#123b29] text-success")}>
                {roleLabels[role]}
              </DropdownMenu.Item>
            ))}
            <DropdownMenu.Separator className="my-1 h-px bg-border" />
            <DropdownMenu.Item onSelect={() => setResetOpen(true)} className="cursor-pointer rounded-md px-3 py-2.5 text-sm text-destructive outline-none hover:bg-[#3b1b1e]">Reset data</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset semua data?"
        description="Draf, keputusan review, dan laporan yang telah dibuat akan kembali ke data awal."
        confirmLabel="Reset data"
        destructive
        onConfirm={() => { resetData(); toast.success("Data berhasil direset."); }}
      />
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <Tooltip.Provider delayDuration={250}>
      <a href="#main-content" className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-md bg-accent px-4 py-2 font-bold text-[#052e20] focus:translate-y-0">Lewati ke konten</a>
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-56 top-24 h-[480px] w-[680px] rounded-full bg-accent-dark/25 blur-[110px]" />
        <div className="absolute -left-56 -top-56 h-[500px] w-[640px] rounded-full bg-accent-dark/25 blur-[120px]" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 md:px-8 xl:px-[74px]">
        <header className="flex h-24 items-center justify-between border-b border-[#2e2e30]">
          <Link href="/" className="min-w-fit rounded-md">
            <span className="block font-display text-xl font-bold tracking-[-.4px]">Pagi Sore</span>
          </Link>
          <nav className="hidden rounded-[9px] border border-border bg-surface p-1 md:flex" aria-label="Navigasi utama">
            {desktopNav.map((item) => (
              <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined} className={cn("grid min-h-[39px] min-w-[82px] place-items-center rounded-md px-4 text-[13px] text-muted transition hover:text-foreground", isActive(pathname, item.href) && "bg-primary font-bold text-foreground")}>
                {item.label}
              </Link>
            ))}
          </nav>
          <RoleMenu />
        </header>
        <main id="main-content" className="flex-1 pb-12"><div key={pathname} className="page-enter">{children}</div></main>
      </div>
      <nav className="fixed bottom-3 left-1/2 z-40 flex w-[calc(100%-32px)] max-w-[390px] -translate-x-1/2 justify-around rounded-[18px] border border-border bg-[#111113]/95 px-1 py-1.5 shadow-2xl backdrop-blur md:hidden" aria-label="Navigasi mobile">
        {mobileNav.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href, true);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex min-h-[50px] min-w-[72px] flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-medium text-dim", active && "bg-[#123b29] font-bold text-foreground")}>
              <Icon size={17} className={active ? "text-accent" : "text-muted"} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
      <Toaster theme="dark" richColors position="bottom-center" mobileOffset={{ bottom: 96 }} toastOptions={{ duration: 3600 }} />
    </Tooltip.Provider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return <KmsProvider><Shell>{children}</Shell></KmsProvider>;
}
