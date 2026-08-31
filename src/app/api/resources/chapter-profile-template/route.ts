import { NextRequest, NextResponse } from "next/server";

// No PDF binary is generated server-side — the template itself is the
// printable page at /resources/chapter-profile-template, which chapters
// save as a PDF via the browser's print dialog. This route exists so the
// Resources page can link a stable "download" URL to that page.
export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/resources/chapter-profile-template", request.url)
  );
}
