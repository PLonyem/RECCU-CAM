import { NextResponse } from "next/server";
import { networkAffiliates } from "@/data/affiliates";

export async function GET() {
  return NextResponse.json({
    affiliates: networkAffiliates,
    source: "MINFI list as at 31 December 2021",
    completeCurrentDirectory: false,
  });
}
