"use client";

import { useLanguage } from "@/context/LanguageContext";
import { type TranslationKey } from "@/lib/i18n";
import { FadeUp } from "@/components/ui/FadeUp";
import { ImageSlot } from "./ImageSlot";

interface LeadershipRole {
  titleKey: TranslationKey;
  descriptorKey?: TranslationKey;
}

interface LeadershipTier {
  labelKey: TranslationKey;
  roles: LeadershipRole[];
}

// Structure drawn from CamCCUL's own three-tier org chart (elected
// governance → executive management → department heads, plus a small
// support-services group) — not a roster of names. No individual has been
// named for any of these roles yet, so cards show the role/department
// only, with a photo placeholder, exactly like the no-fabrication pattern
// used everywhere else on this site: real structure, never invented people.
const TIERS: LeadershipTier[] = [
  {
    labelKey: "about_v2_tier_governance",
    roles: [
      { titleKey: "about_v2_role_board" },
      { titleKey: "about_v2_role_supervisory" },
      { titleKey: "about_v2_role_credit_committee" },
    ],
  },
  {
    labelKey: "about_v2_tier_management",
    roles: [{ titleKey: "about_v2_role_gm" }, { titleKey: "about_v2_role_agm" }],
  },
  {
    labelKey: "about_v2_tier_departments",
    roles: [
      { titleKey: "about_v2_role_finance", descriptorKey: "about_v2_role_finance_desc" },
      {
        titleKey: "about_v2_role_central_finance",
        descriptorKey: "about_v2_role_central_finance_desc",
      },
      {
        titleKey: "about_v2_role_internal_audit",
        descriptorKey: "about_v2_role_internal_audit_desc",
      },
      {
        titleKey: "about_v2_role_risk_compliance",
        descriptorKey: "about_v2_role_risk_compliance_desc",
      },
      { titleKey: "about_v2_role_it", descriptorKey: "about_v2_role_it_desc" },
      { titleKey: "about_v2_role_training", descriptorKey: "about_v2_role_training_desc" },
      {
        titleKey: "about_v2_role_affiliate_services",
        descriptorKey: "about_v2_role_affiliate_services_desc",
      },
      { titleKey: "about_v2_role_protection", descriptorKey: "about_v2_role_protection_desc" },
      { titleKey: "about_v2_role_marketing", descriptorKey: "about_v2_role_marketing_desc" },
    ],
  },
  {
    labelKey: "about_v2_tier_support",
    roles: [
      { titleKey: "about_v2_role_hr", descriptorKey: "about_v2_role_hr_desc" },
      { titleKey: "about_v2_role_legal", descriptorKey: "about_v2_role_legal_desc" },
    ],
  },
];

// SECTION 7b — Our Leadership. Sits directly under Team. Pale blue tint,
// continuing the page's alternating rhythm before the closing CTA band.
export function OurLeadership() {
  const { t } = useLanguage();

  return (
    <section className="bg-primary-500/6 py-16 md:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-4">
        <FadeUp>
          <p className="text-[13px] uppercase tracking-[0.12em] text-primary-600 font-semibold">
            {t("about_v2_leadership_eyebrow")}
          </p>
          <h2 className="mt-3 text-[28px] md:text-[40px] font-display font-bold leading-tight text-primary-900">
            {t("about_v2_leadership_heading")}
          </h2>
        </FadeUp>

        <div className="mt-12 space-y-12">
          {TIERS.map((tier) => (
            <div key={tier.labelKey}>
              <FadeUp>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-700 border-b border-primary-200 pb-3">
                  {t(tier.labelKey)}
                </h3>
              </FadeUp>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-6">
                {tier.roles.map((role, i) => (
                  <FadeUp key={role.titleKey} index={i}>
                    <ImageSlot label={t(role.titleKey)} className="aspect-square" />
                    <p className="mt-3 font-display font-semibold text-primary-900 leading-snug">
                      {t(role.titleKey)}
                    </p>
                    {role.descriptorKey && (
                      <p className="text-xs text-primary-600 mt-0.5">
                        {t(role.descriptorKey)}
                      </p>
                    )}
                  </FadeUp>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
