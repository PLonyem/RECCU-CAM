"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, RotateCcw, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  FieldError,
  FormNotice,
  formControlClassName,
  RequiredFieldsNote,
  RequiredMark,
} from "@/components/forms/FormControls";
import { Button, buttonVariants } from "@/components/ui";
import { contactPurposeOptions } from "@/data/contact";
import { type ContactInquiry, contactInquirySchema } from "@/lib/validation/contact";
import { cn } from "@/lib/utils";

const fieldLabelClassName = "text-sm font-semibold text-institutional";
const genericSubmissionError =
  "We were unable to submit your inquiry at this time. Please review your information and try again.";
const serverSubmissionError =
  "Something went wrong while sending your message. Please try again shortly.";

function errorId(name: keyof ContactInquiry) {
  return `contact-${name}-error`;
}

export function ContactInquiryForm() {
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const noticeRef = useRef<HTMLDivElement>(null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ContactInquiry>({
    resolver: zodResolver(contactInquirySchema),
    defaultValues: {
      companyWebsite: "",
      fullName: "",
      phone: "",
      email: "",
      organization: "",
      role: "",
      purpose: undefined,
      subject: "",
      message: "",
      consent: false,
    },
  });
  const messageLength = useWatch({ control, name: "message" })?.length ?? 0;

  useEffect(() => {
    if (submitted || submissionError) noticeRef.current?.focus();
  }, [submitted, submissionError]);

  async function submitInquiry(values: ContactInquiry) {
    setSubmissionError(null);
    setSubmitted(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        setSubmissionError(response.status >= 500 ? serverSubmissionError : genericSubmissionError);
        return;
      }

      reset();
      setSubmitted(true);
    } catch {
      setSubmissionError(serverSubmissionError);
    }
  }

  if (submitted) {
    return (
      <FormNotice
        ref={noticeRef}
        variant="success"
        title="Thank You for Contacting RECCU-CAM"
        className="bg-surface p-7 sm:p-9"
      >
        <p>
          Your inquiry has been received successfully. The appropriate team will review your
          message and respond using the contact information you provided.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Please keep your phone or email available if further information is required.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className={buttonVariants({ variant: "default" })}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Return Home
          </Link>
          <Button type="button" variant="secondary" onClick={() => setSubmitted(false)}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Send Another Message
          </Button>
        </div>
      </FormNotice>
    );
  }

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit(submitInquiry)}
      noValidate
      className="space-y-7"
      aria-busy={isSubmitting}
    >
      <RequiredFieldsNote />
      <input
        {...register("companyWebsite")}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block" htmlFor="contact-full-name">
          <span className={fieldLabelClassName}>Full Name<RequiredMark /></span>
          <input
            {...register("fullName")}
            id="contact-full-name"
            required
            maxLength={120}
            autoComplete="name"
            className={formControlClassName}
            placeholder="Enter your full name"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? errorId("fullName") : undefined}
          />
          <FieldError id={errorId("fullName")} message={errors.fullName?.message} />
        </label>

        <label className="block" htmlFor="contact-phone">
          <span className={fieldLabelClassName}>Phone Number<RequiredMark /></span>
          <input
            {...register("phone")}
            id="contact-phone"
            type="tel"
            inputMode="tel"
            required
            maxLength={30}
            autoComplete="tel"
            className={formControlClassName}
            placeholder="e.g. +237 6XX XXX XXX"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? errorId("phone") : undefined}
          />
          <FieldError id={errorId("phone")} message={errors.phone?.message} />
        </label>

        <label className="block" htmlFor="contact-email">
          <span className={fieldLabelClassName}>Email Address <span className="font-normal text-muted-foreground">(Optional)</span></span>
          <input
            {...register("email")}
            id="contact-email"
            type="email"
            inputMode="email"
            maxLength={254}
            autoComplete="email"
            className={formControlClassName}
            placeholder="name@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? errorId("email") : undefined}
          />
          <FieldError id={errorId("email")} message={errors.email?.message} />
        </label>

        <label className="block" htmlFor="contact-organization">
          <span className={fieldLabelClassName}>Organization / Institution <span className="font-normal text-muted-foreground">(Optional)</span></span>
          <input
            {...register("organization")}
            id="contact-organization"
            maxLength={160}
            autoComplete="organization"
            className={formControlClassName}
            placeholder="Enter your organization or credit union"
            aria-invalid={Boolean(errors.organization)}
            aria-describedby={errors.organization ? errorId("organization") : undefined}
          />
          <FieldError id={errorId("organization")} message={errors.organization?.message} />
        </label>

        <label className="block" htmlFor="contact-role">
          <span className={fieldLabelClassName}>Role / Position <span className="font-normal text-muted-foreground">(Optional)</span></span>
          <input
            {...register("role")}
            id="contact-role"
            maxLength={120}
            autoComplete="organization-title"
            className={formControlClassName}
            placeholder="e.g. Branch Manager, Credit Officer, Partner Representative"
            aria-invalid={Boolean(errors.role)}
            aria-describedby={errors.role ? errorId("role") : undefined}
          />
          <FieldError id={errorId("role")} message={errors.role?.message} />
        </label>

        <label className="block" htmlFor="contact-purpose">
          <span className={fieldLabelClassName}>Purpose of Contact<RequiredMark /></span>
          <select
            {...register("purpose")}
            id="contact-purpose"
            required
            className={formControlClassName}
            aria-invalid={Boolean(errors.purpose)}
            aria-describedby={errors.purpose ? errorId("purpose") : "contact-purpose-guidance"}
          >
            <option value="">Select the purpose of your inquiry</option>
            {contactPurposeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <p id="contact-purpose-guidance" className="mt-2 text-xs leading-5 text-muted-foreground">
            Your selection helps route the inquiry to the appropriate team.
          </p>
          <FieldError id={errorId("purpose")} message={errors.purpose?.message} />
        </label>

        <label className="block sm:col-span-2" htmlFor="contact-subject">
          <span className={fieldLabelClassName}>Subject<RequiredMark /></span>
          <input
            {...register("subject")}
            id="contact-subject"
            required
            maxLength={160}
            className={formControlClassName}
            placeholder="Briefly describe your inquiry"
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? errorId("subject") : undefined}
          />
          <FieldError id={errorId("subject")} message={errors.subject?.message} />
        </label>

        <label className="block sm:col-span-2" htmlFor="contact-message">
          <span className={fieldLabelClassName}>Message<RequiredMark /></span>
          <textarea
            {...register("message")}
            id="contact-message"
            required
            minLength={20}
            maxLength={2000}
            rows={8}
            className={cn(formControlClassName, "min-h-48 resize-y py-3")}
            placeholder="Tell us how we can assist you..."
            aria-invalid={Boolean(errors.message)}
            aria-describedby={`contact-message-count${errors.message ? ` ${errorId("message")}` : ""}`}
          />
          <div className="mt-2 flex items-start justify-between gap-4 text-xs leading-5 text-muted-foreground">
            <span>Include enough context for accurate routing.</span>
            <span id="contact-message-count" className="shrink-0 tabular-nums">{messageLength} / 2000</span>
          </div>
          <FieldError id={errorId("message")} message={errors.message?.message} />
        </label>
      </div>

      <div className="rounded-card border border-primary-100 bg-primary-50 p-4 text-sm leading-6 text-institutional">
        Do not include passwords, PINs, OTPs, banking credentials, or confidential account
        information. RECCU-CAM will never request those details through this form.
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3" htmlFor="contact-consent">
          <input
            {...register("consent")}
            id="contact-consent"
            type="checkbox"
            required
            className="mt-1 h-5 w-5 shrink-0 rounded border-border text-forest accent-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? errorId("consent") : undefined}
          />
          <span className="text-sm leading-6 text-foreground">
            I agree that RECCU-CAM may use the information provided to respond to my inquiry.
            <RequiredMark /> Read the <Link href="/privacy" className="font-semibold text-forest underline decoration-gold underline-offset-4">Privacy Policy</Link>.
          </span>
        </label>
        <FieldError id={errorId("consent")} message={errors.consent?.message} />
      </div>

      {submissionError && (
        <FormNotice ref={noticeRef} variant="error" title="Inquiry not submitted">
          <p>{submissionError}</p>
        </FormNotice>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Submitting inquiry…" : "Submit Inquiry"}
        {!isSubmitting && <Send className="h-4 w-4" aria-hidden="true" />}
      </Button>
    </form>
  );
}
