import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminNavGuard } from "@/components/admin/AdminNavGuard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  // Any authenticated Clerk user could be a credit_union account — a
  // chapter session must never reach the admin shell.
  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    redirect("/login");
  }

  // Deliberately NOT calling currentUser() here — unlike auth(), which
  // reads/verifies the session JWT already on the request with no network
  // round trip, currentUser() hits Clerk's API live. This layout re-runs on
  // every admin navigation (it's dynamic because of auth() above), so that
  // extra fetch was real, avoidable latency on every single click between
  // sidebar tabs. AdminShell's children now read the signed-in user
  // client-side via Clerk's useUser() instead, which is already hydrated
  // from ClerkProvider's own client-side state — no extra request at all.
  return (
    <AdminShell>
      <AdminNavGuard />
      {children}
    </AdminShell>
  );
}
