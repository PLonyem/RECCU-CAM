"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface CreditUnionNavbarProps {
  user: {
    name?: string | null;
  };
}

export function CreditUnionNavbar({ user }: CreditUnionNavbarProps) {
  const { signOut } = useClerk();
  const { t } = useLanguage();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut({ redirectUrl: "/" });
  }

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3 rounded-lg">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
            <Image
              src="/logo.jpg"
              alt="CamCCUL logo"
              width={74}
              height={90}
              priority
              className="h-10 w-10 object-contain"
            />
          </div>
          <div className="min-w-0 leading-tight">
            <span className="font-display block text-xl font-bold text-primary-900">CamCCUL</span>
            <span className="block truncate text-xs text-gray-500">
              {t("nav_credit_union_portal")}
            </span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <span className="hidden max-w-[220px] truncate text-sm font-medium text-gray-700 sm:block">
            {user.name}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isSigningOut ? t("nav_signing_out") : t("nav_sign_out")}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
