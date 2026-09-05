import "server-only";

import { auth } from "@clerk/nextjs/server";
import { isAffiliateRole } from "@/lib/auth/roles";

export async function getAffiliateSession() {
  const { userId, sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role;
  const affiliateId = sessionClaims?.metadata?.affiliateId;
  if (!userId || !isAffiliateRole(role) || !affiliateId) return null;
  return { userId, affiliateId, metadata: sessionClaims.metadata };
}
