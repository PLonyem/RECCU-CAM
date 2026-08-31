"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Building2, ChevronDown, Mail, MapPin, Phone, SearchX } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FadeUp } from "@/components/ui/FadeUp";
import { useLanguage } from "@/context/LanguageContext";
import { type TranslationKey } from "@/lib/i18n";
import { isPlaceholder, cn } from "@/lib/utils";

interface PublicAffiliateProfile {
  id: string;
  code: string;
  name: string;
  regionId: string;
  regionName: string;
  chapterId: string;
  chapterName: string;
  city: string | null;
  profileStatus: string | null;
  // profileStatus defaults to "pending" in the DB for every affiliate,
  // submitted or not — this is the real "did this chapter ever submit
  // anything" signal (see src/app/api/affiliates/route.ts).
  hasSubmittedProfile: boolean;
  address: string | null;
  phone: string | null;
  email: string | null;
  yearEstablished: number | null;
  briefHistory: string | null;
  totalMembers: number | null;
  branchCount: number | null;
  services: string[];
  chapterPresident: string | null;
  chapterSupervisor: string | null;
  boardSize: number | null;
  staffCount: number | null;
}

interface PublicChapter {
  id: string;
  name: string;
  creditUnions: PublicAffiliateProfile[];
}

interface PublicRegion {
  id: string;
  name: string;
  chapters: PublicChapter[];
}

function AffiliateProfileDetails({
  affiliate,
  t,
}: {
  affiliate: PublicAffiliateProfile;
  t: (key: TranslationKey) => string;
}) {
  const profileStatus = affiliate.profileStatus;

  if (!affiliate.hasSubmittedProfile) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 mt-2 border border-gray-200">
        <p className="text-sm text-gray-600">{t("affiliates_profile_unavailable_message")}</p>
      </div>
    );
  }

  if (profileStatus === "pending") {
    return (
      <div className="bg-amber-50 rounded-lg p-6 mt-2 border border-amber-200 flex gap-3">
        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
        <p className="text-sm text-amber-700">{t("affiliates_profile_pending_banner")}</p>
      </div>
    );
  }

  if (profileStatus === "rejected") {
    return (
      <div className="bg-gray-50 rounded-lg p-6 mt-2 border border-gray-200">
        <p className="text-sm text-gray-600">{t("affiliates_profile_rejected_message")}</p>
      </div>
    );
  }

  if (profileStatus !== "approved") {
    return (
      <div className="bg-gray-50 rounded-lg p-6 mt-2 border border-gray-200">
        <p className="text-sm text-gray-600">{t("affiliates_profile_unavailable_message")}</p>
      </div>
    );
  }

  const hasAddress = !isPlaceholder(affiliate.address);
  const hasPhone = !isPlaceholder(affiliate.phone);
  const hasEmail = !isPlaceholder(affiliate.email);
  const hasAnyContact = hasAddress || hasPhone || hasEmail;
  const hasHistory = !isPlaceholder(affiliate.briefHistory);
  const hasServices = affiliate.services.length > 0;
  const hasChairperson = !isPlaceholder(affiliate.chapterPresident);
  const hasManager = !isPlaceholder(affiliate.chapterSupervisor);
  const hasBoardSize = affiliate.boardSize != null;
  const hasStaffCount = affiliate.staffCount != null;

  return (
    <div className="bg-gray-50 rounded-lg p-6 mt-2 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h3 className="font-semibold text-primary-900">
              {t("chapter_about_prefix")} {affiliate.name}
            </h3>
            {hasHistory && (
              <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-line">
                {affiliate.briefHistory}
              </p>
            )}
            {(affiliate.yearEstablished != null ||
              affiliate.totalMembers != null ||
              affiliate.branchCount != null) && (
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs text-gray-500">
                {affiliate.yearEstablished != null && (
                  <span>
                    {t("affiliate_year_founded_label")}: {affiliate.yearEstablished}
                  </span>
                )}
                {affiliate.totalMembers != null && (
                  <span>
                    {t("chapter_members_label")}: {affiliate.totalMembers}
                  </span>
                )}
                {affiliate.branchCount != null && (
                  <span>
                    {t("chapter_branches_label")}: {affiliate.branchCount}
                  </span>
                )}
              </div>
            )}
          </div>

          {hasServices && (
            <div>
              <h3 className="font-semibold text-primary-900 text-sm uppercase tracking-wide">
                {t("chapter_services_heading")}
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {affiliate.services.map((service) => (
                  <Badge key={service} variant="primary">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(hasChairperson || hasManager || hasBoardSize || hasStaffCount) && (
            <div>
              <h3 className="font-semibold text-primary-900 text-sm uppercase tracking-wide">
                {t("affiliate_leadership_heading")}
              </h3>
              <div className="flex flex-wrap gap-x-8 gap-y-1 mt-2 text-sm text-gray-700">
                {hasChairperson && (
                  <span>
                    {t("affiliate_board_chairperson_label")}: {affiliate.chapterPresident}
                  </span>
                )}
                {hasManager && (
                  <span>
                    {t("affiliate_general_manager_label")}: {affiliate.chapterSupervisor}
                  </span>
                )}
                {hasBoardSize && (
                  <span>
                    {t("chapter_board_size_label")}: {affiliate.boardSize}
                  </span>
                )}
                {hasStaffCount && (
                  <span>
                    {t("chapter_staff_count_label")}: {affiliate.staffCount}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <h3 className="font-semibold text-primary-900 text-sm uppercase tracking-wide">
            {t("chapter_contact_heading")}
          </h3>
          <div className="mt-2 space-y-2 text-sm text-gray-700">
            {hasPhone && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-primary-500 mt-0.5 shrink-0" />
                <span>{affiliate.phone}</span>
              </div>
            )}
            {hasEmail && (
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-primary-500 mt-0.5 shrink-0" />
                <span>{affiliate.email}</span>
              </div>
            )}
            {hasAddress && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary-500 mt-0.5 shrink-0" />
                <span>{affiliate.address}</span>
              </div>
            )}
            {!hasAnyContact && (
              <p className="text-gray-500">{t("affiliates_profile_pending_message")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AffiliatesPageContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const regionParam = searchParams.get("region") ?? "";

  const [regions, setRegions] = useState<PublicRegion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [expandedAffiliate, setExpandedAffiliate] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/affiliates")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load affiliates");
        return res.json();
      })
      .then((data: { regions: PublicRegion[] }) => {
        if (ignore) return;
        const items = data.regions ?? [];
        setRegions(items);
        if (regionParam) {
          const normalized = regionParam.replace(/\s+/g, "").toLowerCase();
          const matched = items.find((region) =>
            region.name.replace(/\s*Region$/i, "").replace(/\s+/g, "").toLowerCase() === normalized
          );
          if (matched) setSelectedRegionId(matched.id);
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (!ignore) {
          setLoadError(true);
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [regionParam]);

  const selectedRegion = regions.find((region) => region.id === selectedRegionId);
  const selectedChapter = selectedRegion?.chapters.find((chapter) => chapter.id === selectedChapterId);

  function selectRegion(regionId: string) {
    setSelectedRegionId(regionId);
    setSelectedChapterId("");
    setExpandedAffiliate(null);
  }

  function toggleAffiliate(code: string) {
    setExpandedAffiliate((prev) => (prev === code ? null : code));
  }

  return (
    <div className="bg-gray-50 min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-4">
        <FadeUp>
          <Card className="p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold text-primary-900">{t("affiliates_select_title")}</h2>
            <p className="mt-2 text-gray-600">{t("affiliates_select_description")}</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="region-select" className="mb-2 block text-sm font-semibold text-primary-900">{t("affiliates_step_region")}</label>
            <select
                  id="region-select"
                  value={selectedRegionId}
                  onChange={(event) => selectRegion(event.target.value)}
                  className="h-12 w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            >
                  <option value="">{t("affiliates_select_region_placeholder")}</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>{region.name.replace(/ Region$/i, "")}</option>
              ))}
            </select>
              </div>

              {selectedRegion && (
                <div>
                  <label htmlFor="chapter-select" className="mb-2 block text-sm font-semibold text-primary-900">{t("affiliates_step_chapter")}</label>
                  <select
                    id="chapter-select"
                    value={selectedChapterId}
                    onChange={(event) => { setSelectedChapterId(event.target.value); setExpandedAffiliate(null); }}
                    className="h-12 w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">{t("affiliates_select_placeholder")}</option>
                    {selectedRegion.chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </Card>
        </FadeUp>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-gray-400">{t("loading_text")}</div>
        ) : loadError ? (
          <div className="py-12 text-center text-sm text-gray-500">{t("affiliates_load_error")}</div>
        ) : selectedChapter ? (
          <div className="mt-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">{t("affiliates_step_credit_unions")}</p>
                <h3 className="mt-1 font-display text-2xl font-bold text-primary-900">{selectedChapter.name} Chapter</h3>
              </div>
              <p className="text-sm text-gray-500">{selectedChapter.creditUnions.length} credit {selectedChapter.creditUnions.length === 1 ? "union" : "unions"}</p>
            </div>
            {selectedChapter.creditUnions.length > 0 ? (
              <div className="space-y-3">
                {selectedChapter.creditUnions.map((affiliate, index) => {
                  const isOpen = expandedAffiliate === affiliate.code;
                  return (
                    <FadeUp key={affiliate.id} index={index % 8}>
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleAffiliate(affiliate.code)}
                          aria-expanded={isOpen}
                          className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors text-left"
                        >
                          <Building2 className="h-5 w-5 text-primary-500 shrink-0" />
                          {affiliate.hasSubmittedProfile && affiliate.profileStatus === "approved" && (
                            <span
                              className="h-2 w-2 rounded-full bg-green-500 shrink-0"
                              title={t("affiliates_profile_available")}
                              aria-label={t("affiliates_profile_available")}
                            />
                          )}
                          <span className="font-semibold text-primary-900 flex-1 min-w-0 truncate">
                            <span className="mr-2 font-mono text-xs text-gray-500">{affiliate.code}</span>
                            {affiliate.name}
                          </span>
                          {affiliate.profileStatus === "approved" && <Badge variant="success" className="shrink-0">{t("affiliates_approved")}</Badge>}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-gray-400 transition-transform shrink-0",
                              isOpen && "rotate-180"
                            )}
                          />
                        </button>

                        {isOpen && <AffiliateProfileDetails affiliate={affiliate} t={t} />}
                      </div>
                    </FadeUp>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
                <SearchX className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">{t("affiliates_empty_title")}</p>
                <p className="text-gray-500 text-sm mt-1">{t("affiliates_empty_subtitle")}</p>
              </div>
            )}
          </div>
        ) : selectedRegion ? (
          <p className="mt-8 text-center text-sm text-gray-500">{t("affiliates_select_chapter_prompt")}</p>
        ) : (
          <p className="mt-8 text-center text-sm text-gray-500">{t("affiliates_select_region_prompt")}</p>
        )}
      </div>
    </div>
  );
}

function AffiliatesFallback() {
  return (
    <div className="bg-gray-50 min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-4">
        <Card className="p-8 text-center mx-auto max-w-lg">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <div className="h-14 rounded-xl border-2 border-gray-200 bg-gray-50 animate-pulse" />
        </Card>
      </div>
    </div>
  );
}

export default function AffiliatesPage() {
  const { t } = useLanguage();

  return (
    <>
      <PageHero
        title={t("affiliates_page_title")}
        subtitle={t("affiliates_page_subtitle")}
        breadcrumb={[
          { label: t("nav_home"), href: "/" },
          { label: t("nav_affiliates"), href: "/affiliates" },
        ]}
      />

      <Suspense fallback={<AffiliatesFallback />}>
        <AffiliatesPageContent />
      </Suspense>
    </>
  );
}
