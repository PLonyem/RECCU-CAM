"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  Bell, BookOpenCheck, Building2, CircleUserRound, FileCheck2, FileText, GraduationCap,
  HandCoins, Headphones, LayoutDashboard, LogOut, Menu, MessageSquareText,
} from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";
import { cn } from "@/lib/utils";

const navItems = [
  ["Overview", "/affiliate-portal", LayoutDashboard],
  ["Institution Profile", "/affiliate-portal/institution-profile", Building2],
  ["Compliance", "/affiliate-portal/compliance", FileCheck2],
  ["Documents", "/affiliate-portal/documents", FileText],
  ["Circulars", "/affiliate-portal/circulars", BookOpenCheck],
  ["VTIME Training", "/affiliate-portal/vtime", GraduationCap],
  ["Affiliate Banking", "/affiliate-portal/affiliate-banking", HandCoins],
  ["Support Requests", "/affiliate-portal/support", Headphones],
  ["Notices", "/affiliate-portal/notices", Bell],
  ["Account", "/affiliate-portal/account", CircleUserRound],
] as const;

export function PortalShell({ institutionName, children }: { institutionName: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { signOut } = useClerk();

  const sidebar = (
    <aside className="flex h-full w-72 flex-col bg-institutional text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <Link href="/affiliate-portal" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <BrandMark className="h-11 w-11 bg-white text-institutional" />
          <span><span className="block font-display text-lg font-bold">RECCU-CAM</span><span className="block text-xs text-primary-200">Affiliate workspace</span></span>
        </Link>
      </div>
      <div className="border-b border-white/10 px-6 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary-300">Institution</p>
        <p className="mt-1 truncate text-sm font-semibold">{institutionName}</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {navItems.map(([label, href, Icon]) => {
          const active = href === "/affiliate-portal" ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} onClick={() => setOpen(false)} className={cn("mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-white text-institutional" : "text-primary-100 hover:bg-white/10 hover:text-white")}><Icon className="h-4 w-4" />{label}</Link>;
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link href="/contact" className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-100 hover:bg-white/10"><MessageSquareText className="h-4 w-4" />Contact RECCU-CAM</Link>
        <button type="button" onClick={() => signOut({ redirectUrl: "/" })} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary-100 hover:bg-white/10"><LogOut className="h-4 w-4" />Sign out</button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
      {open && <><button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" /><div className="fixed inset-y-0 left-0 z-50 lg:hidden">{sidebar}</div></>}
      <div className="min-w-0 flex-1 lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
          <p className="hidden truncate text-sm font-semibold text-institutional sm:block">{institutionName}</p>
          <Link href="/" className="text-sm font-semibold text-forest hover:underline">Public website</Link>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
