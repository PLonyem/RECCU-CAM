"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { type TranslationKey } from "@/lib/i18n";
import { PrintButton } from "./PrintButton";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold uppercase tracking-wide border-b-2 border-black pb-1 mb-5">
      {children}
    </h2>
  );
}

function FieldRow({
  label,
  optionalLabel,
}: {
  label: string;
  optionalLabel?: string;
}) {
  return (
    <div className="flex items-end gap-3 py-2.5 border-b border-black/70">
      <span className="text-sm shrink-0 whitespace-nowrap">
        {label}
        {optionalLabel && <span className="text-black/60"> {optionalLabel}</span>}:
      </span>
      <span className="flex-1" />
    </div>
  );
}

function BlankLines({ label, count }: { label: string; count: number }) {
  return (
    <div className="py-2.5">
      <p className="text-sm mb-3">{label}:</p>
      <div className="space-y-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="border-b border-black/70" />
        ))}
      </div>
    </div>
  );
}

function Checkbox({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span
        className="inline-block h-4 w-4 border border-black shrink-0"
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function CreditUnionProfileTemplateClient() {
  const { t } = useLanguage();

  const serviceKeys: TranslationKey[] = [
    "cu_form_service_savings",
    "cu_form_service_loans_personal",
    "cu_form_service_loans_business",
    "cu_form_service_loans_agricultural",
    "cu_form_service_money_transfers",
    "cu_form_service_mobile_banking",
    "cu_form_service_financial_education",
  ];

  return (
    <div className="bg-white text-black">
      <div className="max-w-4xl mx-auto px-4 py-8 print:px-0 print:py-0">
        <Link
          href="/resources"
          className="print:hidden inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("cu_form_back_to_resources")}
        </Link>

        <div className="print:hidden flex justify-end mb-6">
          <PrintButton />
        </div>

        {/* HEADER */}
        <header className="flex items-start gap-4 border-b-2 border-black pb-6 mb-8">
          <div className="w-14 h-14 rounded-md ring-1 ring-black/20 flex items-center justify-center overflow-hidden p-1 shrink-0">
            <Image
              src="/logo.jpg"
              alt="CamCCUL logo"
              width={56}
              height={56}
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("cu_form_title")}</h1>
            <p className="text-sm mt-2 max-w-2xl">{t("cu_form_description")}</p>
            <p className="text-xs text-black/60 mt-2">
              {t("cu_form_version_label")} {t("cu_form_version_value")}
            </p>
          </div>
        </header>

        <div className="space-y-10">
          {/* SECTION 1 */}
          <section>
            <SectionTitle>{t("cu_form_section1_title")}</SectionTitle>
            <FieldRow label={t("cu_form_full_name")} />
            <FieldRow label={t("cu_form_chapter_field")} />
            <FieldRow label={t("cu_form_affiliation_code")} />
            <FieldRow label={t("cu_form_year_founded")} />
            <FieldRow label={t("cu_form_physical_address")} />
            <FieldRow label={t("cu_form_city_town")} />
          </section>

          {/* SECTION 2 */}
          <section>
            <SectionTitle>{t("cu_form_section2_title")}</SectionTitle>
            <FieldRow label={t("cu_form_primary_phone")} />
            <FieldRow
              label={t("cu_form_secondary_phone")}
              optionalLabel={t("cu_form_optional_suffix")}
            />
            <FieldRow label={t("cu_form_email_address")} />
            <FieldRow label={t("cu_form_website")} optionalLabel={t("cu_form_optional_suffix")} />
          </section>

          {/* SECTION 3 */}
          <section>
            <SectionTitle>{t("cu_form_section3_title")}</SectionTitle>
            <BlankLines label={t("cu_form_brief_history")} count={15} />
            <FieldRow label={t("cu_form_current_members")} />

            <div className="py-2.5">
              <p className="text-sm mb-2">{t("cu_form_services_offered")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                {serviceKeys.map((key) => (
                  <Checkbox key={key} label={t(key)} />
                ))}
              </div>
              <div className="flex items-end gap-3 pt-1.5">
                <span
                  className="inline-block h-4 w-4 border border-black shrink-0"
                  aria-hidden="true"
                />
                <span className="text-sm shrink-0">{t("cu_form_other_label")}</span>
                <span className="flex-1 border-b border-black/70" />
              </div>
            </div>
          </section>

          {/* SECTION 4 */}
          <section>
            <SectionTitle>{t("cu_form_section4_title")}</SectionTitle>
            <FieldRow label={t("cu_form_board_chairperson")} />
            <FieldRow label={t("cu_form_general_manager")} />
            <FieldRow label={t("cu_form_board_members_count")} />
            <FieldRow label={t("cu_form_staff_count")} />
          </section>

          {/* SECTION 5 */}
          <section className="break-inside-avoid">
            <SectionTitle>{t("cu_form_section5_title")}</SectionTitle>
            <p className="text-sm mb-4">{t("cu_form_certify")}</p>
            <FieldRow label={t("cu_form_completed_by")} />
            <FieldRow label={t("cu_form_position")} />
            <FieldRow label={t("cu_form_date")} />
            <FieldRow label={t("cu_form_signature")} />
          </section>
        </div>

        {/* FOOTER */}
        <footer className="border-t-2 border-black mt-10 pt-4 text-xs text-black/70 space-y-1">
          <p>{t("cu_form_footer_upload")}</p>
          <p>{t("cu_form_footer_assistance")}</p>
        </footer>
      </div>
    </div>
  );
}
