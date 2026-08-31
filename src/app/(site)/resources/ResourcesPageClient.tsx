"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText, FileSpreadsheet, Download, FolderOpen } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { FadeUp } from "@/components/ui/FadeUp";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { type TranslationKey } from "@/lib/i18n";

const tabs: { labelKey: TranslationKey; category: string }[] = [
  { labelKey: "resources_tab_templates", category: "ReportingTemplate" },
  { labelKey: "resources_tab_cobac", category: "COBACRegulation" },
  { labelKey: "resources_tab_training", category: "TrainingMaterial" },
  { labelKey: "resources_tab_forms", category: "Form" },
];

function fileIcon(fileType: string | null) {
  return fileType === "XLSX" ? FileSpreadsheet : FileText;
}

export interface PublicResource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileType: string | null;
  fileUrl?: string | null;
}

function ResourcesPageContent({ resources }: { resources: PublicResource[] }) {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  // Deep-linked from the credit union dashboard's Resources nav dropdown
  // (e.g. /resources?category=Form) — falls back to the first tab for any
  // missing or unrecognized value instead of a blank/broken filter state.
  const categoryParam = searchParams.get("category");
  const matchedTab = tabs.find((tab) => tab.category === categoryParam);
  const [activeCategory, setActiveCategory] = useState(matchedTab?.category ?? tabs[0].category);

  const filteredResources = resources.filter(
    (resource) => resource.category === activeCategory
  );

  return (
    <>
      <PageHero title={t("resources_page_title")} subtitle={t("resources_page_subtitle")} />

      <div className="sticky top-16 z-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.category}
              type="button"
              onClick={() => setActiveCategory(tab.category)}
              className={cn(
                "px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer",
                activeCategory === tab.category
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-4">
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => {
                const Icon = fileIcon(resource.fileType);
                return (
                  <FadeUp key={resource.id} index={index % 6}>
                    <Card className="p-6 flex flex-col h-full">
                      <Icon className="h-8 w-8 text-primary-500 mb-3" />
                      <h3 className="font-semibold text-lg text-primary-900 mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-600 flex-grow mb-4 line-clamp-3">
                        {resource.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="default">{resource.fileType ?? "—"}</Badge>
                        {resource.fileUrl ? (
                          <Link
                            href={resource.fileUrl}
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-sm")}
                          >
                            <Download className="h-4 w-4" />
                            {t("resources_download")}
                          </Link>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-sm"
                            disabled
                          >
                            <Download className="h-4 w-4" />
                            {t("resources_download")}
                          </Button>
                        )}
                      </div>
                    </Card>
                  </FadeUp>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24">
              <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {t("resources_empty_title")}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {t("resources_empty_subtitle")}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// useSearchParams (for the ?category= deep link) requires a Suspense
// boundary around whatever reads it — same pattern as the /affiliates page.
export function ResourcesPageClient({ resources }: { resources: PublicResource[] }) {
  return (
    <Suspense fallback={null}>
      <ResourcesPageContent resources={resources} />
    </Suspense>
  );
}
