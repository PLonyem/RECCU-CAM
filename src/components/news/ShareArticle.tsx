"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Link as LinkIcon, Check, MessageCircle, Share2, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { siteUrl } from "@/config/institution";

interface ShareArticleProps {
  title: string;
  slug: string;
}

export function ShareArticle({ title, slug }: ShareArticleProps) {
  const { t } = useLanguage();
  const url = `${siteUrl}/news/${slug}`;
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (copyState === "idle") return;
    const timer = window.setTimeout(() => setCopyState("idle"), 2500);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const emailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

  return (
    <div className="mt-8 border-t border-border pt-6">
      <p className="mb-3 text-sm font-medium text-muted-foreground">
        {t("news_share_article")}
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex min-h-11 items-center gap-2 rounded-control bg-muted px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          aria-live="polite"
        >
          {copyState === "copied" ? <Check className="h-4 w-4" /> : copyState === "error" ? <AlertTriangle className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
          {copyState === "copied" ? t("news_copied") : copyState === "error" ? "Copy unavailable" : t("news_copy_link")}
        </button>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-control bg-success-subtle px-3 py-2 text-sm font-semibold text-success transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>

        <a
          href={facebookHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary-50 px-3 py-2 text-sm font-semibold text-forest transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
        >
          <Share2 className="h-4 w-4" />
          Facebook
        </a>

        <a
          href={emailHref}
          className="inline-flex min-h-11 items-center gap-2 rounded-control bg-muted px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
        >
          <Mail className="h-4 w-4" />
          {t("news_email")}
        </a>
      </div>
    </div>
  );
}
