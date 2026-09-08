import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldX } from "lucide-react";
import { AccessDeniedSignOut } from "@/components/auth/AccessDeniedSignOut";
import { BrandMark } from "@/components/brand/BrandMark";
import { isClerkConfigured } from "@/lib/auth/config";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { getServerTranslator } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { tText } = await getServerTranslator();
  return { title: tText("Access Not Authorized"), description: tText("This account does not have access to a protected RECCU-CAM workspace."), robots: { index: false, follow: false, noarchive: true } };
}

export default async function AccessDeniedPage() {
  const { tText } = await getServerTranslator();
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <LanguageSwitcher className="absolute right-4 top-4" />
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-900/5 sm:p-10">
        <BrandMark className="mx-auto h-14 w-14 bg-institutional text-white" />
        <span className="mx-auto mt-7 grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-700">
          <ShieldX className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-strong">{tText("Protected workspace")}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-institutional">{tText("Access not authorized.")}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
          {tText("This account does not currently have access to a RECCU-CAM protected workspace.")}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-800 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {tText("Back to Website")}
          </Link>
          {isClerkConfigured() && <AccessDeniedSignOut />}
        </div>
      </section>
    </main>
  );
}
