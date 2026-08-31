"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MapPin,
  Mail,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/ui/FadeUp";
import { FacebookIcon } from "@/components/ui/SocialIcon";
import { contactInfo } from "@/lib/mock-data";
import { useLanguage } from "@/context/LanguageContext";
import { localize, type TranslationKey } from "@/lib/i18n";

const CAMCCUL_FACEBOOK_URL = "https://www.facebook.com/CamCCUL/";

type ContactFormValues = z.infer<ReturnType<typeof buildContactSchema>>;

type FormStatus = "idle" | "submitting" | "success" | "error";

function buildContactSchema(t: (key: TranslationKey) => string) {
  return z.object({
    name: z.string().min(2, t("contact_validation_name")),
    email: z.string().email(t("contact_validation_email")),
    phone: z.string().optional(),
    subject: z.string().min(5, t("contact_validation_subject")),
    message: z.string().min(10, t("contact_validation_message")),
  });
}

export default function ContactPage() {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<FormStatus>("idle");

  const contactSchema = useMemo(() => buildContactSchema(t), [t]);

  const infoItems: {
    icon: typeof MapPin;
    label: string;
    value: string;
    href?: string;
  }[] = [
    { icon: MapPin, label: t("contact_label_address"), value: contactInfo.address },
    {
      icon: Mail,
      label: t("contact_label_email"),
      value: contactInfo.email,
      href: `mailto:${contactInfo.email}`,
    },
    { icon: Clock, label: t("contact_label_office_hours"), value: localize(contactInfo.officeHours, language) },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  });

  return (
    <>
      <PageHero title={t("contact_page_title")} subtitle={t("contact_page_subtitle")} />

      <div className="bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeUp className="md:col-span-2">
              <Card className="p-8">
                {status === "success" ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                    <h2 className="text-2xl font-bold text-green-800 mt-4">
                      {t("contact_thank_you")}
                    </h2>
                    <p className="text-green-600 mt-2">
                      {t("contact_thank_you_message")}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-6"
                      onClick={() => {
                        reset();
                        setStatus("idle");
                      }}
                    >
                      {t("contact_send_another")}
                    </Button>
                  </div>
                ) : (
                  <>
                    {status === "error" && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 mb-6">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <p className="text-red-700 text-sm">
                          {t("contact_error_message")}
                        </p>
                      </div>
                    )}

                    <form onSubmit={onSubmit} noValidate>
                      <div className="space-y-1 mb-5">
                        <label
                          htmlFor="name"
                          className="text-sm font-medium text-gray-700"
                        >
                          {t("contact_label_name")}
                        </label>
                        <input
                          id="name"
                          type="text"
                          disabled={status === "submitting"}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                          {...register("name")}
                        />
                        <p className="text-xs text-red-500 min-h-[16px]">
                          {errors.name?.message}
                        </p>
                      </div>

                      <div className="space-y-1 mb-5">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium text-gray-700"
                        >
                          {t("contact_label_email")}
                        </label>
                        <input
                          id="email"
                          type="email"
                          disabled={status === "submitting"}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                          {...register("email")}
                        />
                        <p className="text-xs text-red-500 min-h-[16px]">
                          {errors.email?.message}
                        </p>
                      </div>

                      <div className="space-y-1 mb-5">
                        <label
                          htmlFor="phone"
                          className="text-sm font-medium text-gray-700"
                        >
                          {t("contact_label_phone_number")}
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          disabled={status === "submitting"}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                          {...register("phone")}
                        />
                        <p className="text-xs text-red-500 min-h-[16px]">
                          {errors.phone?.message}
                        </p>
                      </div>

                      <div className="space-y-1 mb-5">
                        <label
                          htmlFor="subject"
                          className="text-sm font-medium text-gray-700"
                        >
                          {t("contact_label_subject")}
                        </label>
                        <input
                          id="subject"
                          type="text"
                          disabled={status === "submitting"}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                          {...register("subject")}
                        />
                        <p className="text-xs text-red-500 min-h-[16px]">
                          {errors.subject?.message}
                        </p>
                      </div>

                      <div className="space-y-1 mb-5">
                        <label
                          htmlFor="message"
                          className="text-sm font-medium text-gray-700"
                        >
                          {t("contact_label_message")}
                        </label>
                        <textarea
                          id="message"
                          rows={5}
                          disabled={status === "submitting"}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:opacity-50"
                          {...register("message")}
                        />
                        <p className="text-xs text-red-500 min-h-[16px]">
                          {errors.message?.message}
                        </p>
                      </div>

                      <Button
                        type="submit"
                        variant="accent"
                        size="lg"
                        className="w-full"
                        disabled={status === "submitting"}
                      >
                        {status === "submitting" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("contact_sending")}
                          </>
                        ) : (
                          t("contact_send_message")
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </Card>
            </FadeUp>

            <FadeUp index={1} className="md:col-span-1">
              <Card className="p-6 h-fit sticky top-24">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">
                  {t("contact_info_title")}
                </h3>

                {infoItems.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex gap-3 mb-4">
                    <div className="bg-primary-100 rounded-full p-2 h-9 w-9 text-primary-600 flex-shrink-0 flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="text-sm font-medium text-primary-900 hover:text-accent-600 hover:underline transition-colors"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-primary-900">
                          {value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <p className="text-xs text-gray-400 italic mt-4">
                  {t("contact_immediate_assistance_note")}
                </p>

                <div className="my-4 border-t border-gray-200" />

                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  {t("contact_regional_offices_title")}
                </h4>
                <p className="text-xs text-gray-500">
                  {t("contact_regional_offices_text")}
                </p>

                <div className="my-4 border-t border-gray-200" />

                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  {t("contact_follow_us_online")}
                </h4>
                <a
                  href={CAMCCUL_FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FacebookIcon className="h-5 w-5 text-[#1877F2] shrink-0" />
                  <span className="text-sm font-medium text-primary-900">
                    {t("contact_facebook_link_text")}
                  </span>
                  <ExternalLink className="h-3 w-3 text-gray-400 ml-auto shrink-0" />
                </a>
              </Card>
            </FadeUp>
          </div>
        </div>
      </div>
    </>
  );
}
