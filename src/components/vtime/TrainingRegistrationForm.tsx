"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useSearchParams } from "next/navigation";
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
import { registrationStatusLabels, trainingPrograms } from "@/data/training-programs";
import {
  type VtimeRegistration,
  vtimeRegistrationSchema,
} from "@/lib/validation/vtime-registration";
import { cn } from "@/lib/utils";

const fieldLabelClassName = "text-sm font-semibold text-institutional";

function errorId(name: keyof VtimeRegistration) {
  return `vtime-registration-${name}-error`;
}

export function TrainingRegistrationForm() {
  const searchParams = useSearchParams();
  const requestedProgram = searchParams.get("program") ?? "";
  const validRequestedProgram = trainingPrograms.some((program) => program.slug === requestedProgram)
    ? requestedProgram
    : "";
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const noticeRef = useRef<HTMLDivElement>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<VtimeRegistration>({
    resolver: zodResolver(vtimeRegistrationSchema),
    defaultValues: {
      companyWebsite: "",
      participantName: "",
      institution: "",
      role: "",
      program: validRequestedProgram,
      phone: "",
      email: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (submitted || submissionError) noticeRef.current?.focus();
  }, [submitted, submissionError]);

  async function submitRegistration(values: VtimeRegistration) {
    setSubmissionError(null);
    setSubmitted(false);

    try {
      const response = await fetch("/api/vtime-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "The registration could not be submitted.");

      reset();
      setSubmitted(true);
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "The registration could not be submitted. Please try again later.",
      );
    }
  }

  if (submitted) {
    return (
      <FormNotice ref={noticeRef} variant="success" title="Training registration received.">
        <p>RECCU-CAM can now review the participant information. This confirmation does not reserve a place or confirm a cohort date.</p>
        <Button type="button" variant="secondary" className="mt-6" onClick={() => setSubmitted(false)}>
          Submit another registration
        </Button>
      </FormNotice>
    );
  }

  return (
    <form onSubmit={handleSubmit(submitRegistration)} noValidate className="space-y-6" aria-busy={isSubmitting}>
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
        <label className="block" htmlFor="vtime-registration-participant-name">
          <span className={fieldLabelClassName}>Participant name<RequiredMark /></span>
          <input
            {...register("participantName")}
            id="vtime-registration-participant-name"
            required
            autoComplete="name"
            className={formControlClassName}
            placeholder="Full name"
            aria-invalid={Boolean(errors.participantName)}
            aria-describedby={errors.participantName ? errorId("participantName") : undefined}
          />
          <FieldError id={errorId("participantName")} message={errors.participantName?.message} />
        </label>

        <label className="block" htmlFor="vtime-registration-institution">
          <span className={fieldLabelClassName}>Institution<RequiredMark /></span>
          <input
            {...register("institution")}
            id="vtime-registration-institution"
            required
            autoComplete="organization"
            className={formControlClassName}
            placeholder="Institution name"
            aria-invalid={Boolean(errors.institution)}
            aria-describedby={errors.institution ? errorId("institution") : undefined}
          />
          <FieldError id={errorId("institution")} message={errors.institution?.message} />
        </label>

        <label className="block" htmlFor="vtime-registration-role">
          <span className={fieldLabelClassName}>Role<RequiredMark /></span>
          <input
            {...register("role")}
            id="vtime-registration-role"
            required
            autoComplete="organization-title"
            className={formControlClassName}
            placeholder="Role or position"
            aria-invalid={Boolean(errors.role)}
            aria-describedby={errors.role ? errorId("role") : undefined}
          />
          <FieldError id={errorId("role")} message={errors.role?.message} />
        </label>

        <label className="block" htmlFor="vtime-registration-program">
          <span className={fieldLabelClassName}>Program<RequiredMark /></span>
          <select
            {...register("program")}
            id="vtime-registration-program"
            required
            className={formControlClassName}
            aria-invalid={Boolean(errors.program)}
            aria-describedby={errors.program ? errorId("program") : undefined}
          >
            <option value="">Select a program</option>
            {trainingPrograms.map((program) => (
              <option key={program.id} value={program.slug}>
                {program.title} — {registrationStatusLabels[program.registrationStatus]}
              </option>
            ))}
          </select>
          <FieldError id={errorId("program")} message={errors.program?.message} />
        </label>

        <label className="block" htmlFor="vtime-registration-phone">
          <span className={fieldLabelClassName}>Phone<RequiredMark /></span>
          <input
            {...register("phone")}
            id="vtime-registration-phone"
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

        <label className="block" htmlFor="vtime-registration-email">
          <span className={fieldLabelClassName}>Email<RequiredMark /></span>
          <input
            {...register("email")}
            id="vtime-registration-email"
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

        <label className="block sm:col-span-2" htmlFor="vtime-registration-notes">
          <span className={fieldLabelClassName}>Notes <span className="font-normal text-muted-foreground">(optional)</span></span>
          <textarea
            {...register("notes")}
            id="vtime-registration-notes"
            rows={5}
            className={cn(formControlClassName, "min-h-32 py-3")}
            placeholder="Optional accessibility needs, learning goals, or questions"
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={errors.notes ? errorId("notes") : undefined}
          />
          <FieldError id={errorId("notes")} message={errors.notes?.message} />
        </label>
      </div>

      <div className="rounded-card border border-primary-100 bg-primary-50 p-4 text-sm leading-6 text-institutional">
        No payment is collected through this form. Submission records registration interest and does not confirm a seat, schedule, venue, facilitator, or participation terms.
      </div>

      {submissionError && (
        <FormNotice ref={noticeRef} variant="error" title="Registration not submitted">
          <p>{submissionError}</p>
        </FormNotice>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Submitting registration…" : "Submit Training Registration"}
        {!isSubmitting && <Send className="h-4 w-4" aria-hidden="true" />}
      </Button>
    </form>
  );
}
