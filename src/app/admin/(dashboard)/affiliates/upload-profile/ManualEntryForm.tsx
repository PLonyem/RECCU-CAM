"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { regionLabels } from "@/lib/mock-data";
import type { ChapterOption } from "@/components/admin/ChapterCombobox";
import type { ExtractedChapterFields } from "@/lib/chapter-profile-extraction";

// Admin UI stays English-only — mirrors the format used on the public
// directory and the credit union combobox.
function chapterLabelFor(region: string): string {
  return `${regionLabels[region]?.en ?? region} Chapter`;
}

const SERVICE_OPTIONS = [
  "Savings Accounts",
  "Loans (Personal)",
  "Loans (Business)",
  "Loans (Agricultural)",
  "Money Transfers",
  "Mobile Banking",
  "Financial Education",
];

const manualEntrySchema = z.object({
  yearEstablished: z.string(),
  address: z.string(),
  city: z.string(),
  phone: z.string(),
  email: z.union([z.literal(""), z.string().email("Invalid email address")]),
  history: z.string(),
  totalMembers: z.string(),
  branchCount: z.string(),
  servicesOffered: z.array(z.string()),
  servicesOfferedOther: z.string(),
  presidentName: z.string(),
  supervisorName: z.string(),
  boardMemberCount: z.string(),
  staffCount: z.string(),
});

type ManualEntryValues = z.infer<typeof manualEntrySchema>;

const emptyDefaults: ManualEntryValues = {
  yearEstablished: "",
  address: "",
  city: "",
  phone: "",
  email: "",
  history: "",
  totalMembers: "",
  branchCount: "",
  servicesOffered: [],
  servicesOfferedOther: "",
  presidentName: "",
  supervisorName: "",
  boardMemberCount: "",
  staffCount: "",
};

function toDefaults(extracted?: ExtractedChapterFields | null): ManualEntryValues {
  if (!extracted) return emptyDefaults;
  return {
    ...emptyDefaults,
    yearEstablished: extracted.yearEstablished?.toString() ?? "",
    address: extracted.address ?? "",
    city: extracted.city ?? "",
    phone: extracted.phone ?? "",
    email: extracted.email ?? "",
    history: extracted.history ?? "",
    totalMembers: extracted.totalMembers?.toString() ?? "",
    branchCount: extracted.branchCount?.toString() ?? "",
    presidentName: extracted.presidentName ?? "",
    supervisorName: extracted.supervisorName ?? "",
    boardMemberCount: extracted.boardMemberCount?.toString() ?? "",
    staffCount: extracted.staffCount?.toString() ?? "",
  };
}

function buildProfilePayload(values: ManualEntryValues) {
  const toNullableNumber = (raw: string) => (raw.trim() === "" ? null : Number(raw));
  const services = values.servicesOfferedOther.trim()
    ? [...values.servicesOffered, `Other: ${values.servicesOfferedOther.trim()}`]
    : values.servicesOffered;

  return {
    address: values.address || null,
    city: values.city || null,
    phone: values.phone || null,
    email: values.email || null,
    yearEstablished: toNullableNumber(values.yearEstablished),
    briefHistory: values.history || null,
    totalMembers: toNullableNumber(values.totalMembers),
    branchCount: toNullableNumber(values.branchCount),
    services,
    chapterPresident: values.presidentName || null,
    chapterSupervisor: values.supervisorName || null,
    boardSize: toNullableNumber(values.boardMemberCount),
    staffCount: toNullableNumber(values.staffCount),
  };
}

const inputClass =
  "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50";
const labelClass = "text-sm font-medium text-gray-700";

interface ManualEntryFormProps {
  chapter: ChapterOption;
  extractedFields?: ExtractedChapterFields | null;
  onSuccess: () => void;
}

export function ManualEntryForm({
  chapter,
  extractedFields,
  onSuccess,
}: ManualEntryFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManualEntryValues>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: toDefaults(extractedFields),
  });

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);

    const res = await fetch(`/api/admin/affiliates/${chapter.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildProfilePayload(values)),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setSubmitError(body?.error ?? "Something went wrong. Please try again.");
      return;
    }

    onSuccess();
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      {/* Credit union identity — auto-filled from the selection above, read-only here */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 bg-gray-50 rounded-lg p-4">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Credit Union Name
          </p>
          <p className="text-sm text-gray-900 mt-1">{chapter.name}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Code</p>
          <p className="text-sm text-gray-900 mt-1">{chapter.code}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Chapter</p>
          <p className="text-sm text-gray-900 mt-1">{chapterLabelFor(chapter.region)}</p>
        </div>
      </div>

      {/* Credit union information */}
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-primary-900 uppercase tracking-wide">
          Credit Union Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label htmlFor="yearEstablished" className={labelClass}>
              Year Founded
            </label>
            <input
              id="yearEstablished"
              type="number"
              disabled={isSubmitting}
              className={inputClass}
              {...register("yearEstablished")}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="city" className={labelClass}>
              City
            </label>
            <input id="city" type="text" disabled={isSubmitting} className={inputClass} {...register("city")} />
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="address" className={labelClass}>
            Address
          </label>
          <input id="address" type="text" disabled={isSubmitting} className={inputClass} {...register("address")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label htmlFor="phone" className={labelClass}>
              Phone
            </label>
            <input id="phone" type="text" disabled={isSubmitting} className={inputClass} {...register("phone")} />
          </div>
          <div className="space-y-1">
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input id="email" type="email" disabled={isSubmitting} className={inputClass} {...register("email")} />
            <p className="text-xs text-red-500 min-h-[16px]">{errors.email?.message}</p>
          </div>
        </div>
      </div>

      {/* Credit union profile */}
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-primary-900 uppercase tracking-wide">
          Credit Union Profile
        </h3>
        <div className="space-y-1">
          <label htmlFor="history" className={labelClass}>
            Brief History
          </label>
          <textarea
            id="history"
            rows={5}
            disabled={isSubmitting}
            className={inputClass}
            {...register("history")}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label htmlFor="totalMembers" className={labelClass}>
              Number of Members
            </label>
            <input
              id="totalMembers"
              type="number"
              disabled={isSubmitting}
              className={inputClass}
              {...register("totalMembers")}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="branchCount" className={labelClass}>
              Number of Branches
            </label>
            <input
              id="branchCount"
              type="number"
              disabled={isSubmitting}
              className={inputClass}
              {...register("branchCount")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className={labelClass}>Services Offered</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {SERVICE_OPTIONS.map((service) => (
              <label key={service} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  value={service}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  {...register("servicesOffered")}
                />
                {service}
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <label htmlFor="servicesOfferedOther" className="text-sm text-gray-700 shrink-0">
              Other:
            </label>
            <input
              id="servicesOfferedOther"
              type="text"
              disabled={isSubmitting}
              className={inputClass}
              {...register("servicesOfferedOther")}
            />
          </div>
        </div>
      </div>

      {/* Leadership */}
      <div className="space-y-5">
        <h3 className="text-sm font-semibold text-primary-900 uppercase tracking-wide">
          Leadership
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label htmlFor="presidentName" className={labelClass}>
              Board Chairperson
            </label>
            <input
              id="presidentName"
              type="text"
              disabled={isSubmitting}
              className={inputClass}
              {...register("presidentName")}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="supervisorName" className={labelClass}>
              General Manager
            </label>
            <input
              id="supervisorName"
              type="text"
              disabled={isSubmitting}
              className={inputClass}
              {...register("supervisorName")}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label htmlFor="boardMemberCount" className={labelClass}>
              Number of Board Members
            </label>
            <input
              id="boardMemberCount"
              type="number"
              disabled={isSubmitting}
              className={inputClass}
              {...register("boardMemberCount")}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="staffCount" className={labelClass}>
              Number of Staff
            </label>
            <input
              id="staffCount"
              type="number"
              disabled={isSubmitting}
              className={inputClass}
              {...register("staffCount")}
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Profile"}
        </Button>
      </div>
    </form>
  );
}
