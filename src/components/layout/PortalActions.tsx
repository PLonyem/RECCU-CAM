"use client";

import Link from "next/link";
import { LayoutDashboard, LogIn, ShieldCheck } from "lucide-react";
import { Show, UserButton, useUser } from "@clerk/nextjs";
import { isAffiliateRole, isStaffRole } from "@/lib/auth/roles";
import { isDemoMode } from "@/lib/demo-mode";

interface PortalActionsProps {
  mobile?: boolean;
  signInLabel: string;
  onNavigate?: () => void;
}

function SignInAction({ mobile, signInLabel, onNavigate }: PortalActionsProps) {
  return (
    <Link
      href="/sign-in"
      onClick={onNavigate}
      className={mobile
        ? "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-institutional transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
        : "inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-institutional transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"}
    >
      <LogIn className="h-4 w-4" aria-hidden="true" /> {signInLabel}
    </Link>
  );
}

function ConfiguredPortalActions({ mobile, signInLabel, onNavigate }: PortalActionsProps) {
  const { user } = useUser();
  const role = user?.publicMetadata.role;
  const portal = isStaffRole(role)
    ? { href: "/admin", label: "Admin Dashboard" }
    : isAffiliateRole(role)
      ? { href: "/affiliate-portal", label: "Affiliate Portal" }
      : null;

  if (mobile) {
    return (
      <div className="grid w-full gap-3">
        <Show
          when="signed-in"
          fallback={<SignInAction mobile signInLabel={signInLabel} onNavigate={onNavigate} />}
        >
          {portal && (
            <Link
              href={portal.href}
              onClick={onNavigate}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> {portal.label}
            </Link>
          )}
          <div className="flex h-11 items-center justify-between rounded-xl border border-border bg-white px-4 text-sm font-semibold text-institutional">
            <span>Account</span>
            <UserButton />
          </div>
        </Show>
      </div>
    );
  }

  return (
    <>
      <Show when="signed-in" fallback={<SignInAction signInLabel={signInLabel} />}>
        {portal && (
          <Link
            href={portal.href}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> {portal.label}
          </Link>
        )}
        <UserButton />
      </Show>
    </>
  );
}

export function PortalActions(props: PortalActionsProps) {
  if (isDemoMode()) {
    return (
      <Link
        href="/admin"
        onClick={props.onNavigate}
        className={props.mobile
          ? "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary-700 bg-primary-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          : "inline-flex h-10 items-center gap-2 rounded-lg border border-primary-700 bg-primary-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"}
        aria-label="Open the RECCU-CAM Admin Dashboard proposal preview"
      >
        <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Admin Dashboard
      </Link>
    );
  }

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <SignInAction {...props} />;
  }

  return <ConfiguredPortalActions {...props} />;
}
