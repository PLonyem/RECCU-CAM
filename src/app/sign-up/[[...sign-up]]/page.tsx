import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";
import { isClerkConfigured } from "@/lib/auth/config";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { getServerTranslator } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { tText } = await getServerTranslator();
  return { title: tText("Create an account"), description: tText("Create your RECCU-CAM Digital Network account."), robots: { index: false, follow: false, noarchive: true } };
}

export default async function SignUpPage() {
  const configured = isClerkConfigured();
  const { tText } = await getServerTranslator();

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 sm:px-8">
      <LanguageSwitcher className="absolute right-4 top-4" />
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mx-auto mb-7 flex w-fit items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
        >
          <BrandMark className="h-12 w-12 bg-institutional text-white" />
          <span>
            <span className="block font-display text-xl font-bold text-institutional">RECCU-CAM</span>
            <span className="block text-xs uppercase tracking-[0.16em] text-slate-500">{tText("Digital Apex Platform")}</span>
          </span>
        </Link>

        {configured ? (
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/auth/complete"
            appearance={{
              variables: { colorPrimary: "#0f5f55", borderRadius: "0.75rem", fontFamily: "var(--font-inter)" },
              elements: {
                rootBox: "w-full",
                card: "w-full border border-slate-200 shadow-xl shadow-slate-900/5",
                headerTitle: "font-display text-institutional",
                headerSubtitle: "text-slate-500",
                formButtonPrimary: "bg-forest hover:bg-institutional",
                footerActionLink: "text-forest hover:text-institutional",
              },
            }}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <ShieldCheck className="mx-auto h-10 w-10 text-forest" />
            <h1 className="mt-4 font-display text-xl font-semibold text-institutional">{tText("Authentication is not configured")}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{tText("Account creation is unavailable until this deployment's Clerk keys are configured.")}</p>
            <Link className="mt-5 inline-flex font-semibold text-forest underline-offset-4 hover:underline" href="/">{tText("Return to the public website")}</Link>
          </div>
        )}

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          {tText("Creating an account does not grant access to staff or affiliate workspaces. Access roles are assigned separately by RECCU-CAM.")}
        </p>
      </div>
    </main>
  );
}
