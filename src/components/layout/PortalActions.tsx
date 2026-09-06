"use client";

import Link from "next/link";
import { LayoutDashboard, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { Show, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { isStaffRole, privateHomeForRole } from "@/lib/auth/roles";
import { isDemoMode } from "@/lib/demo-mode";

interface PortalActionsProps {
  mobile?: boolean;
  signInLabel: string;
  onNavigate?: () => void;
}

function ConfiguredPortalActions({ mobile, signInLabel, onNavigate }: PortalActionsProps) {
  const { user } = useUser();
  const role = user?.publicMetadata.role;
  const portalHref = privateHomeForRole(role);
  const hasPortal = isStaffRole(role) || portalHref === "/affiliate-portal";

  if (mobile) {
    return (
      <div className="grid w-full gap-3">
        <Show when="signed-out">
          <SignInButton mode="redirect">
            <button type="button" onClick={onNavigate} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-institutional">
              <LogIn className="h-4 w-4" /> {signInLabel}
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button type="button" onClick={onNavigate} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-800 px-4 text-sm font-semibold text-white">
              <UserPlus className="h-4 w-4" /> Create account
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <div className="flex items-center gap-3">
            <Link
              href={hasPortal ? portalHref : "/"}
              onClick={onNavigate}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-800 px-4 text-sm font-semibold text-white"
            >
              <LayoutDashboard className="h-4 w-4" /> {hasPortal ? "Open portal" : "Home"}
            </Link>
            <UserButton />
          </div>
        </Show>
      </div>
    );
  }

  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="redirect">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-institutional hover:bg-muted">
            <LogIn className="h-4 w-4" /> {signInLabel}
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-800 px-4 text-sm font-semibold text-white hover:bg-primary-700">
            <UserPlus className="h-4 w-4" /> Create account
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <Link href={hasPortal ? portalHref : "/"} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-800 px-4 text-sm font-semibold text-white hover:bg-primary-700">
          <LayoutDashboard className="h-4 w-4" /> {hasPortal ? "Portal" : "Home"}
        </Link>
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
    return (
      <span className={props.mobile ? "flex flex-1 items-center justify-center rounded-xl bg-gray-100 px-4 text-xs font-semibold text-gray-500" : "rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-500"}>
        Portal setup required
      </span>
    );
  }

  return <ConfiguredPortalActions {...props} />;
}
