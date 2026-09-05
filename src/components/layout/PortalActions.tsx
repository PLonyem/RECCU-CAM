"use client";

import Link from "next/link";
import { LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { isStaffRole, privateHomeForRole } from "@/lib/auth/roles";

interface PortalActionsProps {
  mobile?: boolean;
  signInLabel: string;
  onNavigate?: () => void;
}

function ConfiguredPortalActions({ mobile, signInLabel, onNavigate }: PortalActionsProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const role = user?.publicMetadata.role;
  const portalHref = privateHomeForRole(role);
  const hasPortal = isStaffRole(role) || portalHref === "/affiliate-portal";

  if (!isLoaded) return null;

  if (mobile) {
    return (
      <Link
        href={isSignedIn && hasPortal ? portalHref : "/sign-in"}
        onClick={onNavigate}
        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-800 px-4 text-sm font-semibold text-white"
      >
        {isSignedIn ? <LayoutDashboard className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
        {isSignedIn ? "Open portal" : signInLabel}
      </Link>
    );
  }

  return isSignedIn ? (
    <>
      <Link href={portalHref} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-800 px-4 text-sm font-semibold text-white hover:bg-primary-700">
        <LayoutDashboard className="h-4 w-4" /> Portal
      </Link>
      <button type="button" onClick={() => signOut({ redirectUrl: "/" })} aria-label="Sign out" className="grid h-10 w-10 place-items-center rounded-lg text-gray-500 hover:bg-gray-100">
        <LogOut className="h-4 w-4" />
      </button>
    </>
  ) : (
    <Link href="/sign-in" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-800 px-4 text-sm font-semibold text-white hover:bg-primary-700">
      <LogIn className="h-4 w-4" /> {signInLabel}
    </Link>
  );
}

export function PortalActions(props: PortalActionsProps) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <span className={props.mobile ? "flex flex-1 items-center justify-center rounded-xl bg-gray-100 px-4 text-xs font-semibold text-gray-500" : "rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-500"}>
        Portal setup required
      </span>
    );
  }

  return <ConfiguredPortalActions {...props} />;
}
