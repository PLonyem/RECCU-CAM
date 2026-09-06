import { NextResponse } from "next/server";
import { getPublicAffiliates } from "@/lib/data/public-affiliates";

export async function GET() {
  const affiliates = await getPublicAffiliates();
  return NextResponse.json({
    affiliates,
    source: "RECCU-CAM managed affiliate directory",
    completeCurrentDirectory: true,
  });
}
