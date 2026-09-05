import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { BadgeCheck, FileCheck2, GraduationCap, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";
import { isClerkConfigured } from "@/lib/auth/config";

export const metadata: Metadata = {
  title: "Secure Portal Sign In",
  description: "Secure institutional access to the RECCU-CAM Digital Network.",
  robots: { index: false, follow: false, noarchive: true },
};

const accessPoints = [
  [ShieldCheck, "Secure institutional access"],
  [BadgeCheck, "Affiliate resources"],
  [FileCheck2, "Compliance information"],
  [GraduationCap, "Training tools and protected documents"],
] as const;

export default function SignInPage() {
  const configured = isClerkConfigured();

  return (
    <main className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative overflow-hidden bg-institutional px-6 py-12 text-white sm:px-12 lg:flex lg:min-h-screen lg:items-center lg:px-16 xl:px-24">
        <div aria-hidden="true" className="absolute -right-40 -top-40 h-96 w-96 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -bottom-56 -left-36 h-[32rem] w-[32rem] rounded-full border border-accent-300/20" />
        <div className="relative mx-auto w-full max-w-2xl">
          <Link href="/" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300">
            <BrandMark className="h-14 w-14 bg-white text-institutional" />
            <span>
              <span className="block font-display text-xl font-bold">RECCU-CAM</span>
              <span className="block text-xs uppercase tracking-[0.16em] text-primary-200">Digital Apex Platform</span>
            </span>
          </Link>
          <p className="mt-12 text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">Authorized institutional access</p>
          <h1 className="mt-5 max-w-xl font-display text-4xl font-bold leading-tight sm:text-5xl">Secure Access to the RECCU-CAM Digital Network</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-primary-100">Access institutional resources, compliance tools, training materials, network services, and administrative systems through your authorized account.</p>
          <ul className="mt-9 grid gap-4 sm:grid-cols-2">
            {accessPoints.map(([Icon, label]) => (
              <li key={label} className="flex items-center gap-3 text-sm text-primary-50">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10"><Icon className="h-4 w-4 text-accent-300" aria-hidden="true" /></span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-7 lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">Secure portal</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-institutional">Sign in to continue</h2>
          </div>
          {configured ? (
            <SignIn
              routing="path"
              path="/sign-in"
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
              <h2 className="mt-4 font-display text-xl font-semibold text-institutional">Authentication is not configured</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Portal access is unavailable until this deployment&apos;s Clerk keys are configured.</p>
              <Link className="mt-5 inline-flex font-semibold text-forest underline-offset-4 hover:underline" href="/">Return to the public website</Link>
            </div>
          )}
          <p className="mt-6 text-center text-xs leading-5 text-slate-500">Access is restricted to authorized RECCU-CAM staff and affiliated institutions. Authentication is managed securely by Clerk.</p>
        </div>
      </section>
    </main>
  );
}
