import "server-only";

import { NextResponse } from "next/server";
import { classifyAdminDataError } from "@/lib/admin-data-errors";

export async function adminDataResponse<T>(
  moduleName: string,
  operation: string,
  load: () => Promise<T>,
  successStatus = 200,
) {
  try {
    const data = await load();
    return NextResponse.json(data, {
      status: successStatus,
      headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" },
    });
  } catch (error) {
    return adminDataErrorResponse(moduleName, operation, error);
  }
}

export function adminDataErrorResponse(moduleName: string, operation: string, error: unknown) {
  const details = classifyAdminDataError(error);
  const codeSuffix = details.code ? `:${details.code}` : "";

  console.error(
    `[admin-data] ${moduleName}.${operation} failed (${details.category}${codeSuffix})`,
  );

  return NextResponse.json(
    { error: "Admin data is temporarily unavailable. Please retry." },
    {
      status: details.status,
      headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" },
    },
  );
}
