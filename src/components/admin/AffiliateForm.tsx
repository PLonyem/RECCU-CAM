"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { regions, regionLabels } from "@/lib/mock-data";

export const affiliateFormSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  region: z.string().min(1, "Region is required"),
  city: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.union([z.literal(""), z.string().email("Invalid email address")]),
  isActive: z.boolean(),
});

export type AffiliateFormValues = z.infer<typeof affiliateFormSchema>;

const emptyDefaults: AffiliateFormValues = {
  code: "",
  name: "",
  region: "",
  city: "",
  address: "",
  phone: "",
  email: "",
  isActive: true,
};

export function buildAffiliatePayload(values: AffiliateFormValues) {
  return {
    code: values.code,
    name: values.name,
    region: values.region,
    city: values.city || null,
    address: values.address || null,
    phone: values.phone || null,
    email: values.email || null,
    isActive: values.isActive,
  };
}

interface AffiliateFormProps {
  defaultValues?: Partial<AffiliateFormValues>;
  onSubmit: (values: AffiliateFormValues) => Promise<string | void>;
}

export function AffiliateForm({ defaultValues, onSubmit }: AffiliateFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AffiliateFormValues>({
    resolver: zodResolver(affiliateFormSchema),
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label htmlFor="code" className="text-sm font-medium text-gray-700">
                Code
              </label>
              <input
                id="code"
                type="text"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("code")}
              />
              <p className="text-xs text-red-500 min-h-[16px]">
                {errors.code?.message}
              </p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="region"
                className="text-sm font-medium text-gray-700"
              >
                Region
              </label>
              <select
                id="region"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("region")}
              >
                <option value="">Select a region</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {regionLabels[r]?.en ?? r}
                  </option>
                ))}
              </select>
              <p className="text-xs text-red-500 min-h-[16px]">
                {errors.region?.message}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
              {...register("name")}
            />
            <p className="text-xs text-red-500 min-h-[16px]">
              {errors.name?.message}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label htmlFor="city" className="text-sm font-medium text-gray-700">
                City
              </label>
              <input
                id="city"
                type="text"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("city")}
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="address"
                className="text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <input
                id="address"
                type="text"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("address")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="phone"
                type="text"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("phone")}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                {...register("email")}
              />
              <p className="text-xs text-red-500 min-h-[16px]">
                {errors.email?.message}
              </p>
            </div>
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
              href="/admin/affiliates"
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
