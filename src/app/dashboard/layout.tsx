import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { CreditUnionNavbar } from "@/components/dashboard/CreditUnionNavbar";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

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
  if (role === "admin") redirect("/admin");
  if (role !== "credit_union") redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <CreditUnionNavbar user={{ name: sessionClaims?.metadata?.affiliateName }} />
      <DashboardNav />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
