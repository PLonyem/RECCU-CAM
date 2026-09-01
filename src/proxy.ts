import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/about(.*)",
  "/network(.*)",
  "/services(.*)",
  "/vtime(.*)",
  "/knowledge(.*)",
  "/affiliates(.*)",
  "/resources(.*)",
  "/news(.*)",
  "/faq(.*)",
  "/contact(.*)",
  "/loan-calculator(.*)",
  "/privacy",
  "/terms",
  "/accessibility",
  "/sitemap",
  "/api/affiliates(.*)",
  "/api/affiliate-banking-inquiry",
  "/api/vtime-registration",
]);

const isAuthPage = createRouteMatcher(["/login(.*)", "/signup(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAffiliatePortalRoute = createRouteMatcher(["/affiliate-portal(.*)"]);

const configuredProxy = clerkMiddleware(async (auth, req) => {
  const authObject = await auth();
  const { userId, sessionClaims } = authObject;
  const isAuthenticated = !!userId;
  const role = sessionClaims?.metadata?.role;

  // Logged-in users visiting an auth page go to their assigned dashboard.
  // instead of seeing the form again.
  if (isAuthPage(req) && isAuthenticated) {
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin" : "/dashboard", req.url)
    );
  }
  if (isAuthPage(req)) {
    return NextResponse.next();
  }

  if (isAdminRoute(req)) {
    if (!isAuthenticated) {
      return authObject.redirectToSignIn({ returnBackUrl: req.url });
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (isDashboardRoute(req) || isAffiliatePortalRoute(req)) {
    if (!isAuthenticated) {
      return authObject.redirectToSignIn({ returnBackUrl: req.url });
    }
    if (role !== "credit_union") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

function unconfiguredProxy(req: NextRequest) {
  if (isPublicRoute(req)) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Authentication is not configured." },
      { status: 503 },
    );
  }

  return NextResponse.redirect(new URL("/", req.url));
}

const hasClerkConfiguration = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export default hasClerkConfiguration ? configuredProxy : unconfiguredProxy;

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
