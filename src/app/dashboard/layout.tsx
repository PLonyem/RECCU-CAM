import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { CreditUnionNavbar } from "@/components/dashboard/CreditUnionNavbar";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { isAdminRole, isAffiliateRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Affiliate Portal",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const role = sessionClaims?.metadata?.role;
  if (isAdminRole(role)) redirect("/admin");
  if (!isAffiliateRole(role)) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <CreditUnionNavbar user={{ name: sessionClaims?.metadata?.affiliateName }} />
      <DashboardNav />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
