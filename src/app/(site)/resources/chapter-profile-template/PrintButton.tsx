"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

export function PrintButton() {
  const { t } = useLanguage();

  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className="print:hidden"
    >
      <Download className="h-4 w-4" />
      {t("cu_form_download_pdf")}
    </Button>
  );
}
