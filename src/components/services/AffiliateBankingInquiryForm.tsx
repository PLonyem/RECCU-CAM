"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LockKeyhole, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import {
  affiliateBankingInquirySchema,
  affiliateStatusOptions,
  supportCategoryOptions,
  type AffiliateBankingInquiry,
} from "@/lib/validation/affiliate-banking";
import { cn } from "@/lib/utils";

const inputClassName = "mt-2 min-h-12 w-full rounded-control border border-border bg-surface px-4 text-base text-foreground outline-none transition-[border-color,box-shadow] duration-fast placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-sm font-medium text-error" role="alert">{message}</p>;
}

export function AffiliateBankingInquiryForm() {
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<AffiliateBankingInquiry>({
    resolver: zodResolver(affiliateBankingInquirySchema),
    defaultValues: {
      institution: "",
      contactPerson: "",
      role: "",
      email: "",
      phone: "",
      city: "",
      message: "",
    },
  });

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

      if (!response.ok) {
        throw new Error(result.error || "The inquiry could not be submitted.");
      }

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
      <div role="status" className="rounded-panel border border-success/20 bg-success-subtle p-7">
        <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
        <h3 className="mt-4 font-display text-h3 text-institutional">Inquiry received</h3>
        <p className="mt-3 text-body text-foreground">
          RECCU-CAM can now review the information provided. Submission does not confirm eligibility, terms, or approval.
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => setSubmitted(false)}
        >
          Submit another inquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submitInquiry)} noValidate className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-institutional">Institution</span>
          <input {...register("institution")} autoComplete="organization" className={inputClassName} placeholder="Institution name" aria-invalid={Boolean(errors.institution)} />
          <FieldError message={errors.institution?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-institutional">Affiliate status</span>
          <select {...register("affiliateStatus")} defaultValue="" className={inputClassName} aria-invalid={Boolean(errors.affiliateStatus)}>
            <option value="" disabled>Select status</option>
            {affiliateStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <FieldError message={errors.affiliateStatus?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-institutional">City</span>
          <input {...register("city")} autoComplete="address-level2" className={inputClassName} placeholder="Institution city" aria-invalid={Boolean(errors.city)} />
          <FieldError message={errors.city?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-institutional">Contact person</span>
          <input {...register("contactPerson")} autoComplete="name" className={inputClassName} placeholder="Full name" aria-invalid={Boolean(errors.contactPerson)} />
          <FieldError message={errors.contactPerson?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-institutional">Role</span>
          <input {...register("role")} autoComplete="organization-title" className={inputClassName} placeholder="Role or position" aria-invalid={Boolean(errors.role)} />
          <FieldError message={errors.role?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-institutional">Email</span>
          <input {...register("email")} type="email" autoComplete="email" className={inputClassName} placeholder="name@institution.org" aria-invalid={Boolean(errors.email)} />
          <FieldError message={errors.email?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-institutional">Phone</span>
          <input {...register("phone")} type="tel" autoComplete="tel" className={inputClassName} placeholder="Institutional contact number" aria-invalid={Boolean(errors.phone)} />
          <FieldError message={errors.phone?.message} />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-institutional">Support category</span>
          <select {...register("supportCategory")} defaultValue="" className={inputClassName} aria-invalid={Boolean(errors.supportCategory)}>
            <option value="" disabled>Select a category</option>
            {supportCategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <FieldError message={errors.supportCategory?.message} />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-institutional">Message</span>
          <textarea
            {...register("message")}
            rows={6}
            className={cn(inputClassName, "min-h-36 py-3")}
            placeholder="Describe the institutional need and the outcome you would like to discuss."
            aria-invalid={Boolean(errors.message)}
          />
          <FieldError message={errors.message?.message} />
        </label>
      </div>

      <div className="flex items-start gap-3 rounded-card border border-primary-100 bg-primary-50 p-4 text-sm text-institutional">
        <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
        <p>Do not include passwords, PINs, OTPs, account-access details, or banking credentials. This form begins an institutional conversation; it does not authorize a transaction.</p>
      </div>

      {submissionError && (
        <div role="alert" className="rounded-card border border-error/20 bg-error-subtle p-4 text-sm text-error">
          {submissionError}
        </div>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Submitting inquiry…" : "Submit Information Request"}
        {!isSubmitting && <Send className="h-4 w-4" aria-hidden="true" />}
      </Button>
    </form>
  );
}
