"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FieldError,
  FormNotice,
  formControlClassName,
  RequiredFieldsNote,
  RequiredMark,
} from "@/components/forms/FormControls";
import { Button } from "@/components/ui";
import {
  affiliationInquirySchema,
  type AffiliationInquiry,
} from "@/lib/validation/affiliation-inquiry";
import { cn } from "@/lib/utils";

const fieldLabelClassName = "text-sm font-semibold text-institutional";

function errorId(name: keyof AffiliationInquiry) {
  return `affiliation-${name}-error`;
}
export function AffiliationInquiryForm() {
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const noticeRef = useRef<HTMLDivElement>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<AffiliationInquiry>({
    resolver: zodResolver(affiliationInquirySchema),
    defaultValues: {
      companyWebsite: "",
      institution: "",
      city: "",
      contactPerson: "",
      role: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  useEffect(() => {
    if (submitted || submissionError) noticeRef.current?.focus();
  }, [submitted, submissionError]);

  async function submitInquiry(values: AffiliationInquiry) {
    setSubmissionError(null);
    setSubmitted(false);

    try {
      const response = await fetch("/api/affiliation-inquiry", {
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
      <FormNotice ref={noticeRef} variant="success" title="Affiliation inquiry received">
        <p>RECCU-CAM can now review the contact information provided and follow up with verified guidance. This does not confirm eligibility or affiliation.</p>
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
        <label className="block sm:col-span-2" htmlFor="affiliation-institution">
          <span className={fieldLabelClassName}>Institution<RequiredMark /></span>
          <input
            {...register("institution")}
            id="affiliation-institution"
            required
            autoComplete="organization"
            className={formControlClassName}
            placeholder="Institution name"
            aria-invalid={Boolean(errors.institution)}
            aria-describedby={errors.institution ? errorId("institution") : undefined}
          />
          <FieldError id={errorId("institution")} message={errors.institution?.message} />
        </label>

        <label className="block" htmlFor="affiliation-city">
          <span className={fieldLabelClassName}>City<RequiredMark /></span>
          <input
            {...register("city")}
            id="affiliation-city"
            required
            autoComplete="address-level2"
            className={formControlClassName}
            placeholder="Institution city"
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? errorId("city") : undefined}
          />
          <FieldError id={errorId("city")} message={errors.city?.message} />
        </label>

        <label className="block" htmlFor="affiliation-contact-person">
          <span className={fieldLabelClassName}>Contact person<RequiredMark /></span>
          <input
            {...register("contactPerson")}
            id="affiliation-contact-person"
            required
            autoComplete="name"
            className={formControlClassName}
            placeholder="Full name"
            aria-invalid={Boolean(errors.contactPerson)}
            aria-describedby={errors.contactPerson ? errorId("contactPerson") : undefined}
          />
          <FieldError id={errorId("contactPerson")} message={errors.contactPerson?.message} />
        </label>

        <label className="block" htmlFor="affiliation-role">
          <span className={fieldLabelClassName}>Role<RequiredMark /></span>
          <input
            {...register("role")}
            id="affiliation-role"
            required
            autoComplete="organization-title"
            className={formControlClassName}
            placeholder="Role or position"
            aria-invalid={Boolean(errors.role)}
            aria-describedby={errors.role ? errorId("role") : undefined}
          />
          <FieldError id={errorId("role")} message={errors.role?.message} />
        </label>

        <label className="block" htmlFor="affiliation-phone">
          <span className={fieldLabelClassName}>Phone<RequiredMark /></span>
          <input
            {...register("phone")}
            id="affiliation-phone"
            type="tel"
            required
            autoComplete="tel"
            className={formControlClassName}
            placeholder="Contact number"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? errorId("phone") : undefined}
          />
          <FieldError id={errorId("phone")} message={errors.phone?.message} />
        </label>

        <label className="block sm:col-span-2" htmlFor="affiliation-email">
          <span className={fieldLabelClassName}>Email<RequiredMark /></span>
          <input
            {...register("email")}
            id="affiliation-email"
            type="email"
            required
            autoComplete="email"
            className={formControlClassName}
            placeholder="name@institution.org"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? errorId("email") : undefined}
          />
          <FieldError id={errorId("email")} message={errors.email?.message} />
        </label>

        <label className="block sm:col-span-2" htmlFor="affiliation-message">
          <span className={fieldLabelClassName}>Institution and affiliation interest<RequiredMark /></span>
          <textarea
            {...register("message")}
            id="affiliation-message"
            required
            rows={6}
            className={cn(formControlClassName, "min-h-36 py-3")}
            placeholder="Briefly describe the institution and the affiliation guidance you need."
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? errorId("message") : undefined}
          />
          <FieldError id={errorId("message")} message={errors.message?.message} />
        </label>
      </div>

      <p className="rounded-card border border-primary-100 bg-primary-50 p-4 text-sm leading-6 text-institutional">
        Do not include passwords, PINs, OTPs, banking credentials, or confidential account information. Eligibility and documentation requirements are confirmed separately by RECCU-CAM.
      </p>

      {submissionError && (
        <FormNotice ref={noticeRef} variant="error" title="Inquiry not submitted">
          <p>{submissionError}</p>
        </FormNotice>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Submitting inquiry…" : "Submit Affiliation Inquiry"}
        {!isSubmitting && <Send className="h-4 w-4" aria-hidden="true" />}
      </Button>
    </form>
  );
}
