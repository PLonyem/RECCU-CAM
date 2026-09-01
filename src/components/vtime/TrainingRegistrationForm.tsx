"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Send } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui";
import { registrationStatusLabels, trainingPrograms } from "@/data/training-programs";
import {
  type VtimeRegistration,
  vtimeRegistrationSchema,
} from "@/lib/validation/vtime-registration";
import { cn } from "@/lib/utils";

const inputClassName =
  "mt-2 min-h-12 w-full rounded-control border border-border bg-surface px-4 text-base text-foreground outline-none transition-[border-color,box-shadow] duration-fast placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-sm font-medium text-error" role="alert">{message}</p>;
}

export function TrainingRegistrationForm() {
  const searchParams = useSearchParams();
  const requestedProgram = searchParams.get("program") ?? "";
  const validRequestedProgram = trainingPrograms.some((program) => program.slug === requestedProgram)
    ? requestedProgram
    : "";
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<VtimeRegistration>({
    resolver: zodResolver(vtimeRegistrationSchema),
    defaultValues: {
      participantName: "",
      institution: "",
      role: "",
      program: validRequestedProgram,
      phone: "",
      email: "",
      notes: "",
    },
  });

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
      <div role="status" className="rounded-panel border border-success/20 bg-success-subtle p-7">
        <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
        <h2 className="mt-4 font-display text-h3 text-institutional">Training registration received.</h2>
        <p className="mt-3 text-body text-foreground">
          RECCU-CAM can now review the participant information. This confirmation does not reserve a place or confirm a cohort date.
        </p>
        <Button type="button" variant="secondary" className="mt-6" onClick={() => setSubmitted(false)}>
          Submit another registration
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submitRegistration)} noValidate className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-institutional">Participant name</span>
          <input
            {...register("participantName")}
            autoComplete="name"
            className={inputClassName}
            placeholder="Full name"
            aria-invalid={Boolean(errors.participantName)}
          />
          <FieldError message={errors.participantName?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-institutional">Institution</span>
          <input
            {...register("institution")}
            autoComplete="organization"
            className={inputClassName}
            placeholder="Institution name"
            aria-invalid={Boolean(errors.institution)}
          />
          <FieldError message={errors.institution?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-institutional">Role</span>
          <input
            {...register("role")}
            autoComplete="organization-title"
            className={inputClassName}
            placeholder="Role or position"
            aria-invalid={Boolean(errors.role)}
          />
          <FieldError message={errors.role?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-institutional">Program</span>
          <select {...register("program")} className={inputClassName} aria-invalid={Boolean(errors.program)}>
            <option value="">Select a program</option>
            {trainingPrograms.map((program) => (
              <option key={program.id} value={program.slug}>
                {program.title} — {registrationStatusLabels[program.registrationStatus]}
              </option>
            ))}
          </select>
          <FieldError message={errors.program?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-institutional">Phone</span>
          <input
            {...register("phone")}
            type="tel"
            autoComplete="tel"
            className={inputClassName}
            placeholder="Contact number"
            aria-invalid={Boolean(errors.phone)}
          />
          <FieldError message={errors.phone?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-institutional">Email</span>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            className={inputClassName}
            placeholder="name@institution.org"
            aria-invalid={Boolean(errors.email)}
          />
          <FieldError message={errors.email?.message} />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-institutional">Notes</span>
          <textarea
            {...register("notes")}
            rows={5}
            className={cn(inputClassName, "min-h-32 py-3")}
            placeholder="Optional accessibility needs, learning goals, or questions"
            aria-invalid={Boolean(errors.notes)}
          />
          <FieldError message={errors.notes?.message} />
        </label>
      </div>

      <div className="rounded-card border border-primary-100 bg-primary-50 p-4 text-sm leading-6 text-institutional">
        No payment is collected through this form. Submission records registration interest and does not confirm a seat, schedule, venue, facilitator, or participation terms.
      </div>

      {submissionError && (
        <div role="alert" className="rounded-card border border-error/20 bg-error-subtle p-4 text-sm text-error">
          {submissionError}
        </div>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Submitting registration…" : "Submit Training Registration"}
        {!isSubmitting && <Send className="h-4 w-4" aria-hidden="true" />}
      </Button>
    </form>
  );
}
