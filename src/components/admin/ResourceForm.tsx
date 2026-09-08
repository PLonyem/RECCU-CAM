"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RESOURCE_CATEGORIES } from "@/data/admin-options";
import { formatCategory } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { translateValidationMessage } from "@/lib/i18n";

export const resourceFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  category: z.string().min(1, "Category is required"),
  fileType: z.string(),
  fileUrl: z.string(),
  issuingAuthority: z.string(),
  publicationDate: z.string(),
  accessLevel: z.enum(["PUBLIC", "AFFILIATE_ONLY", "STAFF_ONLY"]),
  published: z.boolean(),
  isActive: z.boolean(),
  titleFr: z.string(),
  descriptionFr: z.string(),
});

export type ResourceFormValues = z.infer<typeof resourceFormSchema>;

const emptyDefaults: ResourceFormValues = {
  title: "",
  description: "",
  category: "",
  fileType: "",
  fileUrl: "",
  issuingAuthority: "",
  publicationDate: "",
  accessLevel: "PUBLIC",
  published: false,
  isActive: true,
  titleFr: "",
  descriptionFr: "",
};

export function buildResourcePayload(values: ResourceFormValues) {
  return {
    title: values.title,
    description: values.description || null,
    category: values.category,
    fileType: values.fileType || null,
    fileUrl: values.fileUrl || null,
    issuingAuthority: values.issuingAuthority || null,
    publicationDate: values.publicationDate || null,
    accessLevel: values.accessLevel,
    published: values.published,
    isActive: values.isActive,
    translations: { fr: { title: values.titleFr, description: values.descriptionFr } },
  };
}

interface ResourceFormProps {
  defaultValues?: Partial<ResourceFormValues>;
  onSubmit: (values: ResourceFormValues) => Promise<string | void>;
}

export function ResourceForm({ defaultValues, onSubmit }: ResourceFormProps) {
  const { language, tText } = useLanguage();
  const validation = (message?: string) => message ? translateValidationMessage(language, message) : "";
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);
    const error = await onSubmit(values);
    setIsSubmitting(false);
    if (error) setSubmitError(error);
  });

  return (
    <>
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 mb-6">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{tText(submitError)}</p>
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={submit} noValidate className="space-y-5">
          <div className="rounded-lg border border-primary-100 bg-primary-50/40 p-4 text-sm text-institutional">
            <strong>English ✓</strong><span className="mx-2">|</span><strong>{defaultValues?.titleFr && defaultValues?.descriptionFr ? "French ✓" : "French — Missing"}</strong>
          </div>
          <div className="space-y-1">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              {tText("Title")}
            </label>
            <input
              id="title"
              type="text"
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
              {...register("title")}
            />
            <p className="text-xs text-red-500 min-h-[16px]">
              {validation(errors.title?.message)}
            </p>
          </div>

          <fieldset className="grid gap-4 rounded-lg border border-primary-100 p-4 sm:grid-cols-2">
            <legend className="px-2 text-sm font-semibold text-institutional">French</legend>
            <label className="text-sm font-medium text-gray-700">Title — French<input type="text" disabled={isSubmitting} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5" {...register("titleFr")} /></label>
            <label className="text-sm font-medium text-gray-700">Description<textarea rows={3} disabled={isSubmitting} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5" {...register("descriptionFr")} /></label>
            <p className="text-xs text-muted-foreground sm:col-span-2">Empty French fields automatically use the published English content.</p>
          </fieldset>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1"><label htmlFor="issuingAuthority" className="text-sm font-medium text-gray-700">{tText("Issuing Authority")}</label><input id="issuingAuthority" type="text" disabled={isSubmitting} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500" {...register("issuingAuthority")} /></div>
            <div className="space-y-1"><label htmlFor="publicationDate" className="text-sm font-medium text-gray-700">{tText("Publication Date")}</label><input id="publicationDate" type="date" disabled={isSubmitting} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500" {...register("publicationDate")} /></div>
            <div className="space-y-1"><label htmlFor="accessLevel" className="text-sm font-medium text-gray-700">{tText("Access Level")}</label><select id="accessLevel" disabled={isSubmitting} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500" {...register("accessLevel")}><option value="PUBLIC">{tText("Public")}</option><option value="AFFILIATE_ONLY">{tText("Affiliate Only")}</option><option value="STAFF_ONLY">{tText("Staff Only")}</option></select></div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              {tText("Description")}
            </label>
            <textarea
              id="description"
              rows={4}
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label
                htmlFor="category"
                className="text-sm font-medium text-gray-700"
              >
                {tText("Category")}
              </label>
              <select
                id="category"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("category")}
              >
                <option value="">{tText("Select a category")}</option>
                {RESOURCE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {tText(formatCategory(category))}
                  </option>
                ))}
              </select>
              <p className="text-xs text-red-500 min-h-[16px]">
                {validation(errors.category?.message)}
              </p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="fileType"
                className="text-sm font-medium text-gray-700"
              >
                {tText("File Type")}
              </label>
              <input
                id="fileType"
                type="text"
                placeholder="PDF, XLSX, DOCX..."
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("fileType")}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="fileUrl"
              className="text-sm font-medium text-gray-700"
            >
              {tText("File URL")}
            </label>
            <input
              id="fileUrl"
              type="text"
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
              {...register("fileUrl")}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              {...register("isActive")}
            />
            {tText("Active")}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" disabled={isSubmitting} className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" {...register("published")} />{tText("Published")}</label>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {tText(isSubmitting ? "Saving..." : "Save")}
            </Button>
            <Link
              href="/admin/resources"
              className={buttonVariants({ variant: "ghost" })}
            >
              {tText("Cancel")}
            </Link>
          </div>
        </form>
      </Card>
    </>
  );
}
