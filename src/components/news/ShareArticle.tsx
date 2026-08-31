"use client";

import { useEffect, useState } from "react";
import { Link as LinkIcon, Check, MessageCircle, Share2, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ShareArticleProps {
  title: string;
  slug: string;
}

export function ShareArticle({ title, slug }: ShareArticleProps) {
  const { t } = useLanguage();
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/news/${slug}`);
  }, [slug]);

  async function handleCopyLink() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const emailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

  return (
    <div className="border-t border-gray-200 pt-6 mt-8">
      <p className="text-sm font-medium text-gray-500 mb-3">
        {t("news_share_article")}
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopyLink}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
          {copied ? t("news_copied") : t("news_copy_link")}
        </button>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>

        <a
          href={facebookHref}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Facebook
        </a>

        <a
          href={emailHref}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          {t("news_email")}
        </a>
      </div>
    </div>
  );
}
