"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  FieldError,
  FormNotice,
  formControlClassName,
  RequiredFieldsNote,
  RequiredMark,
} from "@/components/forms/FormControls";
import { Button } from "@/components/ui/Button";
import {
  affiliateBankingInquirySchema,
  affiliateStatusOptions,
  supportCategoryOptions,
  type AffiliateBankingInquiry,
} from "@/lib/validation/affiliate-banking";
import { cn } from "@/lib/utils";

const fieldLabelClassName = "text-sm font-semibold text-institutional";

function describedBy(name: keyof AffiliateBankingInquiry, hasError: boolean) {
  return hasError ? `affiliate-banking-${name}-error` : undefined;
}

export function AffiliateBankingInquiryForm() {
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const noticeRef = useRef<HTMLDivElement>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<AffiliateBankingInquiry>({
    resolver: zodResolver(affiliateBankingInquirySchema),
    defaultValues: {
      companyWebsite: "",
      institution: "",
      contactPerson: "",
      role: "",
      email: "",
      phone: "",
      city: "",
      message: "",
    },
  });

  useEffect(() => {
    if (submitted || submissionError) noticeRef.current?.focus();
  }, [submitted, submissionError]);

  async function submitInquiry(values: AffiliateBankingInquiry) {
    setSubmissionError(null);
    setSubmitted(false);

    try {
      const response = await fetch("/api/affiliate-banking-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json() as { error?: string };

      if (!response.ok) throw new Error(result.error || "The inquiry could not be submitted.");

      reset();
      setSubmitted(true);
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "The inquiry could not be submitted. Please try again later.",
      );
    }
  }

  if (submitted) {
    return (
      <FormNotice ref={noticeRef} variant="success" title="Inquiry received">
        <p>RECCU-CAM can now review the information provided. Submission does not confirm eligibility, terms, or approval.</p>
        <Button type="button" variant="secondary" className="mt-6" onClick={() => setSubmitted(false)}>
          Submit another inquiry
        </Button>
      </FormNotice>
    );
  }

  return (
    <form onSubmit={handleSubmit(submitInquiry)} noValidate className="space-y-6" aria-busy={isSubmitting}>
      <RequiredFieldsNote />
      <input
        {...register("companyWebsite")}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2" htmlFor="affiliate-banking-institution">
          <span className={fieldLabelClassName}>Institution<RequiredMark /></span>
          <input
            {...register("institution")}
            id="affiliate-banking-institution"
            required
            autoComplete="organization"
            className={formControlClassName}
            placeholder="Institution name"
            aria-invalid={Boolean(errors.institution)}
            aria-describedby={describedBy("institution", Boolean(errors.institution))}
          />
          <FieldError id="affiliate-banking-institution-error" message={errors.institution?.message} />
        </label>

        <label className="block" htmlFor="affiliate-banking-affiliate-status">
          <span className={fieldLabelClassName}>Affiliate status<RequiredMark /></span>
          <select
            {...register("affiliateStatus")}
            id="affiliate-banking-affiliate-status"
            required
            defaultValue=""
            className={formControlClassName}
            aria-invalid={Boolean(errors.affiliateStatus)}
            aria-describedby={describedBy("affiliateStatus", Boolean(errors.affiliateStatus))}
          >
            <option value="" disabled>Select status</option>
            {affiliateStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <FieldError id="affiliate-banking-affiliateStatus-error" message={errors.affiliateStatus?.message} />
        </label>

        <label className="block" htmlFor="affiliate-banking-city">
          <span className={fieldLabelClassName}>City<RequiredMark /></span>
          <input
            {...register("city")}
            id="affiliate-banking-city"
            required
            autoComplete="address-level2"
            className={formControlClassName}
            placeholder="Institution city"
            aria-invalid={Boolean(errors.city)}
            aria-describedby={describedBy("city", Boolean(errors.city))}
          />
          <FieldError id="affiliate-banking-city-error" message={errors.city?.message} />
        </label>

        <label className="block" htmlFor="affiliate-banking-contact-person">
          <span className={fieldLabelClassName}>Contact person<RequiredMark /></span>
          <input
            {...register("contactPerson")}
            id="affiliate-banking-contact-person"
            required
            autoComplete="name"
            className={formControlClassName}
            placeholder="Full name"
            aria-invalid={Boolean(errors.contactPerson)}
            aria-describedby={describedBy("contactPerson", Boolean(errors.contactPerson))}
          />
          <FieldError id="affiliate-banking-contactPerson-error" message={errors.contactPerson?.message} />
        </label>

        <label className="block" htmlFor="affiliate-banking-role">
          <span className={fieldLabelClassName}>Role<RequiredMark /></span>
          <input
            {...register("role")}
            id="affiliate-banking-role"
            required
            autoComplete="organization-title"
            className={formControlClassName}
            placeholder="Role or position"
            aria-invalid={Boolean(errors.role)}
            aria-describedby={describedBy("role", Boolean(errors.role))}
          />
          <FieldError id="affiliate-banking-role-error" message={errors.role?.message} />
        </label>

        <label className="block" htmlFor="affiliate-banking-email">
          <span className={fieldLabelClassName}>Email<RequiredMark /></span>
          <input
            {...register("email")}
            id="affiliate-banking-email"
            type="email"
            required
            autoComplete="email"
            className={formControlClassName}
            placeholder="name@institution.org"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email", Boolean(errors.email))}
          />
          <FieldError id="affiliate-banking-email-error" message={errors.email?.message} />
        </label>

        <label className="block" htmlFor="affiliate-banking-phone">
          <span className={fieldLabelClassName}>Phone<RequiredMark /></span>
          <input
            {...register("phone")}
            id="affiliate-banking-phone"
            type="tel"
            required
            autoComplete="tel"
            className={formControlClassName}
            placeholder="Institutional contact number"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy("phone", Boolean(errors.phone))}
          />
          <FieldError id="affiliate-banking-phone-error" message={errors.phone?.message} />
        </label>

        <label className="block sm:col-span-2" htmlFor="affiliate-banking-support-category">
          <span className={fieldLabelClassName}>Support category<RequiredMark /></span>
          <select
            {...register("supportCategory")}
            id="affiliate-banking-support-category"
            required
            defaultValue=""
            className={formControlClassName}
            aria-invalid={Boolean(errors.supportCategory)}
            aria-describedby={describedBy("supportCategory", Boolean(errors.supportCategory))}
          >
            <option value="" disabled>Select a category</option>
            {supportCategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <FieldError id="affiliate-banking-supportCategory-error" message={errors.supportCategory?.message} />
        </label>

        <label className="block sm:col-span-2" htmlFor="affiliate-banking-message">
          <span className={fieldLabelClassName}>Message<RequiredMark /></span>
          <textarea
            {...register("message")}
            id="affiliate-banking-message"
            required
            rows={6}
            className={cn(formControlClassName, "min-h-36 py-3")}
            placeholder="Describe the institutional need and the outcome you would like to discuss."
            aria-invalid={Boolean(errors.message)}
            aria-describedby={describedBy("message", Boolean(errors.message))}
          />
          <FieldError id="affiliate-banking-message-error" message={errors.message?.message} />
        </label>
      </div>

      <div className="flex items-start gap-3 rounded-card border border-primary-100 bg-primary-50 p-4 text-sm text-institutional">
        <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
        <p>Do not include passwords, PINs, OTPs, account-access details, or banking credentials. This form begins an institutional conversation; it does not authorize a transaction.</p>
      </div>

      {submissionError && (
        <FormNotice ref={noticeRef} variant="error" title="Inquiry not submitted">
          <p>{submissionError}</p>
        </FormNotice>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Submitting inquiry…" : "Submit Information Request"}
        {!isSubmitting && <Send className="h-4 w-4" aria-hidden="true" />}
      </Button>
    </form>
  );
}
