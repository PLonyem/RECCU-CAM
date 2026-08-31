"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <Building2 className="h-20 w-20 text-gray-300 mx-auto" />
        <p className="font-display text-7xl font-bold text-primary-900 mt-6 tracking-tight">
          404
        </p>
        <h1 className="text-xl font-semibold text-gray-600 mt-2">
          {t("notfound_title")}
        </h1>
        <p className="text-sm text-gray-500 mt-3 max-w-sm mx-auto leading-relaxed">
          {t("notfound_message")}
        </p>

        <Link
          href="/"
          className={`${buttonVariants({ variant: "default", size: "lg" })} mt-6`}
        >
          {t("notfound_back_home")}
        </Link>
      </div>
    </div>
  );
}
