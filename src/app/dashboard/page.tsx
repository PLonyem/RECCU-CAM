import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Building2, Mail as MailIcon, Phone } from "lucide-react";
import { AnnouncementsFeed } from "@/components/dashboard/AnnouncementsFeed";
import { DeadlineCountdown } from "@/components/dashboard/DeadlineCountdown";

function AccountConfigurationScreen() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mx-auto">
          <Building2 className="h-7 w-7 text-primary-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mt-4">
          Account Setup Incomplete
        </h1>
        <p className="text-gray-600 mt-2">
          This portal account is not linked to a credit union record. Contact your chapter supervisor
          or CamCCUL headquarters so the account can be corrected.
        </p>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
          Back to Website
        </Link>
      </Card>
    </div>
  );
}

// layout.tsx admits only active credit-union accounts. Every account created
// by the admin flow is linked to its Affiliate record before credentials are
// delivered.
export default async function DashboardPage() {
  const { sessionClaims } = await auth();
  const affiliateId = sessionClaims?.metadata?.affiliateId;
  if (!affiliateId) {
    return <AccountConfigurationScreen />;
  }

  const [affiliate, siteSettings] = await Promise.all([
    prisma.affiliate.findUnique({
      where: { id: affiliateId },
      select: {
        name: true,
        code: true,
        chapter: { select: { name: true } },
      },
    }),
    // Single source of truth for CamCCUL's own contact details (Need Help
    // section below) — never hardcoded here, since this app has a standing
    // history of conflicting phone/email values scattered across files.
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
  ]);
  if (!affiliate) {
    return <AccountConfigurationScreen />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* 1. WELCOME HEADER */}
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900">
          Welcome, {affiliate.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {affiliate.chapter && <Badge>{affiliate.chapter.name}</Badge>}
          <Badge>{affiliate.code}</Badge>
        </div>
      </div>

      {/* 2. DEADLINE COUNTDOWN */}
      <div id="deadline-countdown" className="scroll-mt-28">
        <DeadlineCountdown />
      </div>

      {/* 3. ANNOUNCEMENTS FEED */}
      <div id="announcements" className="scroll-mt-28">
        <AnnouncementsFeed />
      </div>

      {/* 4. NEED HELP */}
      <Card className="p-6">
        <h2 className="font-semibold text-lg text-gray-900 mb-3">Need Help?</h2>
        <div className="space-y-2 text-sm text-gray-600">
          {siteSettings?.phone && (
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400 shrink-0" />
              {siteSettings.phone}
            </p>
          )}
          {siteSettings?.email && (
            <p className="flex items-center gap-2">
              <MailIcon className="h-4 w-4 text-gray-400 shrink-0" />
              {siteSettings.email}
            </p>
          )}
        </div>
        <Link href="/contact" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
          Contact Us
        </Link>
      </Card>
    </div>
  );
}
