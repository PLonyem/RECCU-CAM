import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { privateHomeForRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function AuthenticationCompletePage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");
  redirect(privateHomeForRole(sessionClaims?.metadata?.role));
}
