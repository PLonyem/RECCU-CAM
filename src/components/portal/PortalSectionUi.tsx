"use client";

import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/context/LanguageContext";

export function PortalSectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  const { tText } = useLanguage();
  return <header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">{tText(eyebrow)}</p><h1 className="mt-2 font-display text-3xl font-bold text-institutional">{tText(title)}</h1><p className="mt-2 max-w-3xl text-slate-600">{tText(description)}</p></header>;
}

export function PortalEmptyState({ title, description }: { title: string; description: string }) {
  const { tText } = useLanguage();
  return <Card className="p-10 text-center"><Inbox className="mx-auto h-9 w-9 text-slate-300" aria-hidden="true" /><h2 className="mt-4 font-semibold text-slate-800">{tText(title)}</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{tText(description)}</p></Card>;
}
