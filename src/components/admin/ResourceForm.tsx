"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RESOURCE_CATEGORIES } from "@/lib/mock-data";
import { formatCategory } from "@/lib/utils";

export const resourceFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  category: z.string().min(1, "Category is required"),
  fileType: z.string(),
  fileUrl: z.string(),
  isActive: z.boolean(),
});

export type ResourceFormValues = z.infer<typeof resourceFormSchema>;

const emptyDefaults: ResourceFormValues = {
  title: "",
  description: "",
  category: "",
  fileType: "",
  fileUrl: "",
  isActive: true,
};

export function buildResourcePayload(values: ResourceFormValues) {
  return {
    title: values.title,
    description: values.description || null,
    category: values.category,
    fileType: values.fileType || null,
    fileUrl: values.fileUrl || null,
    isActive: values.isActive,
  };
}

interface ResourceFormProps {
  defaultValues?: Partial<ResourceFormValues>;
  onSubmit: (values: ResourceFormValues) => Promise<string | void>;
}

export function ResourceForm({ defaultValues, onSubmit }: ResourceFormProps) {
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
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={submit} noValidate className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
              {...register("title")}
            />
            <p className="text-xs text-red-500 min-h-[16px]">
              {errors.title?.message}
            </p>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Description
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
                Category
              </label>
              <select
                id="category"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("category")}
              >
                <option value="">Select a category</option>
                {RESOURCE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {formatCategory(category)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-red-500 min-h-[16px]">
                {errors.category?.message}
              </p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="fileType"
                className="text-sm font-medium text-gray-700"
              >
                File Type
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
              File URL
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
            Active
          </label>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
            <Link
              href="/admin/resources"
              className={buttonVariants({ variant: "ghost" })}
            >
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </>
  );
}
