"use client";

import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Users,
  Building,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { regionLabels } from "@/lib/mock-data";
import { useLanguage } from "@/context/LanguageContext";
import { localize } from "@/lib/i18n";
import { isPlaceholder, cn } from "@/lib/utils";

export interface MemberCreditUnionEntry {
  name: string;
  code: string;
}

export interface ChapterDetail {
  id: string;
  code: string;
  name: string;
  region: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  yearEstablished: number | null;
  briefHistory: string | null;
  totalMembers: number | null;
  branchCount: number | null;
  memberCreditUnionCount: number | null;
  services: string[];
  chapterPresident: string | null;
  chapterSupervisor: string | null;
  boardSize: number | null;
  staffCount: number | null;
  memberCreditUnions: MemberCreditUnionEntry[];
  profileStatus: string | null;
}

function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <div className="flex items-center gap-2 text-sm text-primary-200 flex-wrap">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4 shrink-0" />}
            {isLast || !item.href ? (
              <span className="text-white">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-white transition-colors">
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}

function NotFoundState({ requestedCode }: { requestedCode: string }) {
  const { t } = useLanguage();

  return (
    <>
      <section className="bg-primary-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Breadcrumb
            items={[
              { label: t("nav_home"), href: "/" },
              { label: t("nav_affiliates"), href: "/affiliates" },
            ]}
          />
        </div>
      </section>

      <div className="bg-white py-24">
        <div className="max-w-md mx-auto px-4 text-center">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-primary-900">
            {t("chapter_not_found_title")}
          </h1>
          <p className="text-gray-600 mt-3">{t("chapter_not_found_message")}</p>
          <code className="inline-block mt-3 text-xs bg-gray-100 text-gray-500 rounded px-2 py-1">
            {requestedCode}
          </code>
          <Link
            href="/affiliates"
            className={cn(buttonVariants({ variant: "default" }), "mt-8")}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("chapter_not_found_back")}
          </Link>
        </div>
      </div>
    </>
  );
}

export function ChapterProfileClient({
  affiliate,
  requestedCode,
  previewMode = false,
}: {
  affiliate: ChapterDetail | null;
  requestedCode: string;
  // Used by the credit union dashboard's Preview Profile page (src/app/
  // dashboard/profile/preview) to show the full public layout regardless
  // of profileStatus — the entire point of a preview is seeing what
  // "approved" will look like before it's actually approved.
  previewMode?: boolean;
}) {
  const { t, language } = useLanguage();

  if (!affiliate) {
    return <NotFoundState requestedCode={requestedCode} />;
  }

  const regionLabel = localize(
    regionLabels[affiliate.region] ?? { en: affiliate.region, fr: affiliate.region },
    language
  );

  const hasAddress = !isPlaceholder(affiliate.address);
  const hasPhone = !isPlaceholder(affiliate.phone);
  const hasEmail = !isPlaceholder(affiliate.email);
  const hasTotalMembers = affiliate.totalMembers != null;
  const hasBranchCount = affiliate.branchCount != null;
  const hasCreditUnionCount = affiliate.memberCreditUnionCount != null;
  const hasAnyContactInfo =
    hasAddress ||
    hasPhone ||
    hasEmail ||
    hasTotalMembers ||
    hasBranchCount ||
    hasCreditUnionCount;

  const hasHistory = !isPlaceholder(affiliate.briefHistory);
  const hasServices = affiliate.services.length > 0;

  const hasPresident = !isPlaceholder(affiliate.chapterPresident);
  const hasSupervisor = !isPlaceholder(affiliate.chapterSupervisor);
  const hasBoardCount = affiliate.boardSize != null;
  const hasStaffCount = affiliate.staffCount != null;
  const hasAnyLeadershipInfo =
    hasPresident || hasSupervisor || hasBoardCount || hasStaffCount;

  const hasMemberCreditUnions = affiliate.memberCreditUnions.length > 0;
  const isApproved = previewMode || affiliate.profileStatus === "approved";

  return (
    <>
      {previewMode && affiliate.profileStatus !== "approved" && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-sm text-center py-2 px-4">
          {t("chapter_preview_notice")}
        </div>
      )}

      {/* HERO */}
      <section className="bg-primary-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Breadcrumb
            items={[
              { label: t("nav_home"), href: "/" },
              { label: t("nav_affiliates"), href: "/affiliates" },
              {
                label: regionLabel,
                href: `/affiliates?region=${encodeURIComponent(affiliate.region)}`,
              },
              { label: affiliate.name },
            ]}
          />

          <h1 className="font-display text-3xl font-bold mt-4">{affiliate.name}</h1>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Badge className="bg-white/15 text-white">{affiliate.code}</Badge>
            <Badge className="bg-white/15 text-white">{regionLabel}</Badge>
          </div>
        </div>
      </section>

      {!isApproved ? (
        <div className="bg-white py-24">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <p className="text-gray-600">{t("chapter_under_review")}</p>
          </div>
        </div>
      ) : (
        <>
      {/* SECTION 1: CHAPTER OVERVIEW */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="font-display text-xl font-bold text-primary-900">
                {t("chapter_about_prefix")} {affiliate.name}
              </h2>
              <p className="text-gray-600 leading-relaxed mt-4 whitespace-pre-line">
                {hasHistory ? affiliate.briefHistory : t("chapter_history_fallback")}
              </p>

              {affiliate.yearEstablished != null && (
                <p className="text-sm text-gray-500 mt-4">
                  {t("chapter_year_established_label")}: {affiliate.yearEstablished}
                </p>
              )}

              {hasServices && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-primary-900 uppercase tracking-wide">
                    {t("chapter_services_heading")}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {affiliate.services.map((service) => (
                      <Badge key={service} variant="primary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-primary-900 uppercase tracking-wide">
                  {t("chapter_contact_heading")}
                </h3>

                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  {hasAddress && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-primary-500 mt-0.5 shrink-0" />
                      <span>{affiliate.address}</span>
                    </div>
                  )}
                  {hasPhone && (
                    <div className="flex items-start gap-2.5">
                      <Phone className="h-4 w-4 text-primary-500 mt-0.5 shrink-0" />
                      <span>{affiliate.phone}</span>
                    </div>
                  )}
                  {hasEmail && (
                    <div className="flex items-start gap-2.5">
                      <Mail className="h-4 w-4 text-primary-500 mt-0.5 shrink-0" />
                      <span>{affiliate.email}</span>
                    </div>
                  )}
                  {hasTotalMembers && (
                    <div className="flex items-start gap-2.5">
                      <Users className="h-4 w-4 text-primary-500 mt-0.5 shrink-0" />
                      <span>
                        {affiliate.totalMembers} {t("chapter_members_label")}
                      </span>
                    </div>
                  )}
                  {hasBranchCount && (
                    <div className="flex items-start gap-2.5">
                      <Building2 className="h-4 w-4 text-primary-500 mt-0.5 shrink-0" />
                      <span>
                        {affiliate.branchCount} {t("chapter_branches_label")}
                      </span>
                    </div>
                  )}
                  {hasCreditUnionCount && (
                    <div className="flex items-start gap-2.5">
                      <Building className="h-4 w-4 text-primary-500 mt-0.5 shrink-0" />
                      <span>
                        {affiliate.memberCreditUnionCount} {t("chapter_credit_union_count_label")}
                      </span>
                    </div>
                  )}
                  {!hasAnyContactInfo && (
                    <p className="text-gray-500">{t("chapter_generic_fallback")}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: LEADERSHIP */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-display text-xl font-bold text-primary-900">
            {t("chapter_leadership_heading")}
          </h2>

          {hasAnyLeadershipInfo ? (
            <div className="mt-6 space-y-6">
              {(hasPresident || hasSupervisor) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hasPresident && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {t("chapter_president_label")}
                      </p>
                      <p className="text-base text-primary-900 font-semibold mt-1">
                        {affiliate.chapterPresident}
                      </p>
                    </div>
                  )}
                  {hasSupervisor && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {t("chapter_supervisor_label")}
                      </p>
                      <p className="text-base text-primary-900 font-semibold mt-1">
                        {affiliate.chapterSupervisor}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(hasBoardCount || hasStaffCount) && (
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-700">
                  {hasBoardCount && (
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
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6 text-sm text-gray-600">
              {t("chapter_generic_fallback")}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: MEMBER CREDIT UNIONS */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-display text-xl font-bold text-primary-900">
            {t("chapter_credit_unions_heading")}
          </h2>

          {hasMemberCreditUnions ? (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {affiliate.memberCreditUnions.map((mcu, index) => (
                <Link
                  key={`${mcu.code}-${index}`}
                  href={`/affiliates/${mcu.code}`}
                  className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-primary-300 transition-colors"
                >
                  <span className="text-sm font-medium text-primary-900">{mcu.name}</span>
                  <Badge>{mcu.code}</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-6 text-sm text-gray-600">
              {t("chapter_credit_unions_empty")}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: VISIT THE CHAPTER */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-display text-xl font-bold text-primary-900">
            {t("chapter_visit_heading")}
          </h2>

          <div
            className="mt-6 flex flex-col items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl aspect-[16/6] text-gray-400"
            aria-hidden="true"
          >
            <MapPin className="h-8 w-8" strokeWidth={1} />
            <span className="text-sm">{t("chapter_map_placeholder")}</span>
          </div>

          <div className="mt-6 flex flex-col items-start gap-3">
            <Link href="/contact" className={buttonVariants({ variant: "default" })}>
              {t("chapter_contact_cta")}
            </Link>
            <p className="text-xs text-gray-500 max-w-xl">{t("chapter_visit_note")}</p>
          </div>
        </div>
      </section>
        </>
      )}
    </>
  );
}
