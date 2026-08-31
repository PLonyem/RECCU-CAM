"use client";

import { Phone, Mail } from "lucide-react";
import { contactInfo } from "@/lib/mock-data";
import { SocialIcon } from "@/components/ui/SocialIcon";

const CAMCCUL_FACEBOOK_URL = "https://www.facebook.com/CamCCUL/";
const CAMCCUL_YOUTUBE_URL = "https://www.youtube.com/@camerooncooperativecreditunion";

// contactInfo.phone already matches the hero brief's number exactly, so it's
// used directly. The brief's email ("camccul@camccul.com") differs from
// contactInfo.email's ".cm" domain — but ".com" is also what chatbot-kb.ts
// already gives out for CV submissions, so it isn't a one-off typo in the
// brief; it's a pre-existing inconsistency between two real-looking values
// already in the codebase. Using the brief's version here rather than
// silently overriding it with the other one.
const UTILITY_EMAIL = "camccul@camccul.com";
const PHONE_TEL = `tel:+${contactInfo.phone.replace(/\D/g, "")}`;

export function UtilityBar() {
  return (
    <div className="print:hidden hidden md:block w-full bg-primary-900 text-white h-9">
      <div className="max-w-[1200px] mx-auto px-4 h-full flex items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          <a href={PHONE_TEL} className="flex items-center gap-1.5 hover:underline">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {contactInfo.phone}
          </a>
          <a href={`mailto:${UTILITY_EMAIL}`} className="flex items-center gap-1.5 hover:underline">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            {UTILITY_EMAIL}
          </a>
        </div>

        <div className="flex items-center gap-2">
          <SocialIcon platform="facebook" href={CAMCCUL_FACEBOOK_URL} size="sm" className="w-6 h-6" />
          <SocialIcon platform="twitter" href="#" size="sm" className="w-6 h-6" />
          <SocialIcon platform="linkedin" href="#" size="sm" className="w-6 h-6" />
          <SocialIcon platform="youtube" href={CAMCCUL_YOUTUBE_URL} size="sm" className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
