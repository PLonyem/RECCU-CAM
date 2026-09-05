import Link from "next/link";
import { Home, Megaphone, Newspaper, Settings2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function WebsiteContentPage() {
  const modules = [["Homepage", "Hero copy, calls to action, imagery, appearance, and section visibility.", "/admin/homepage", Home], ["Notices", "Official announcements with priority, audience, dates, and publication state.", "/admin/notices", Megaphone], ["News & Events", "Draft, edit, publish, and unpublish institutional articles.", "/admin/news", Newspaper], ["Organization Settings", "Public identity, contact channels, office details, and footer information.", "/admin/settings", Settings2]] as const;
  return <div className="space-y-7"><header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">Public website CMS</p><h1 className="mt-2 font-display text-3xl font-bold text-institutional">Website Content</h1><p className="mt-2 max-w-3xl text-slate-600">Structured editors let authorized staff maintain public information without source-code changes or arbitrary HTML.</p></header><div className="grid gap-4 md:grid-cols-2">{modules.map(([title, description, href, Icon]) => <Link key={href} href={href}><Card className="h-full p-6 transition hover:border-primary-200 hover:shadow-md"><Icon className="h-6 w-6 text-forest" /><h2 className="mt-4 font-display text-xl font-semibold text-institutional">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></Card></Link>)}</div></div>;
}
