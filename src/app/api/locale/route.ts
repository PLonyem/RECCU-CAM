import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, normalizeLanguage } from "@/lib/i18n";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || (body.locale !== "en" && body.locale !== "fr")) {
    return NextResponse.json({ error: "Unsupported locale." }, { status: 400 });
  }

  const locale = normalizeLanguage(body.locale);
  const response = NextResponse.json({ locale });
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  return response;
}
