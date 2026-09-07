import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { OrganizationSettingsForm } from "@/components/admin/OrganizationSettingsForm";

export default async function OrganizationSettingsPage() {
  const settings = await prisma.siteSettings.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });
  const formSettings = {
    siteName: settings.siteName,
    fullName: settings.fullName,
    address: settings.address,
    addressSecondary: settings.addressSecondary,
    phone: settings.phone,
    email: settings.email,
    officeHours: settings.officeHours,
    facebookUrl: settings.facebookUrl,
    linkedinUrl: settings.linkedinUrl,
    twitterUrl: settings.twitterUrl,
  };
  return <div className="space-y-7">
    <header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">Public identity</p><h1 className="mt-2 font-display text-3xl font-bold text-institutional">Organization Settings</h1><p className="mt-2 text-slate-600">Verified contact details saved here are reflected in the public footer and contact page.</p></header>
    <Card className="p-6"><OrganizationSettingsForm settings={formSettings} /></Card>
  </div>;
}
