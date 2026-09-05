import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/auth/config";
import {
  hasPermission,
  isAffiliateRole,
  permissionForAdminPath,
  privateHomeForRole,
} from "@/lib/auth/roles";

const isAuthPage = createRouteMatcher(["/sign-in(.*)", "/login(.*)", "/signup(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAdminApiRoute = createRouteMatcher(["/api/admin(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAffiliatePortalRoute = createRouteMatcher(["/affiliate-portal(.*)"]);

function isCrossOriginMutation(request: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return false;
  if (request.headers.get("sec-fetch-site") === "cross-site") return true;

  const origin = request.headers.get("origin");
  return Boolean(origin && origin !== request.nextUrl.origin);
}

const configuredProxy = clerkMiddleware(async (auth, req) => {
  // Logged-in users visiting an auth page go to their assigned dashboard.
  // instead of seeing the form again.
  if (isAuthPage(req)) {
    const { userId, sessionClaims } = await auth();
    if (userId) {
      return NextResponse.redirect(
        new URL(privateHomeForRole(sessionClaims?.metadata?.role), req.url),
      );
    }
    return NextResponse.next();
  }

  if (isAdminApiRoute(req)) {
    if (isCrossOriginMutation(req)) {
      return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
    }
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (!hasPermission(sessionClaims?.metadata?.role, permissionForAdminPath(req.nextUrl.pathname))) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (isAdminRoute(req)) {
    const authObject = await auth();
    if (!authObject.userId) {
      return authObject.redirectToSignIn({ returnBackUrl: req.url });
    }
    if (!hasPermission(authObject.sessionClaims?.metadata?.role, permissionForAdminPath(req.nextUrl.pathname))) {
      return NextResponse.redirect(new URL(privateHomeForRole(authObject.sessionClaims?.metadata?.role), req.url));
    }
    return NextResponse.next();
  }

  if (isDashboardRoute(req) || isAffiliatePortalRoute(req)) {
    const authObject = await auth();
    if (!authObject.userId) {
      return authObject.redirectToSignIn({ returnBackUrl: req.url });
    }
    if (!isAffiliateRole(authObject.sessionClaims?.metadata?.role)) {
      return NextResponse.redirect(
        new URL(privateHomeForRole(authObject.sessionClaims?.metadata?.role), req.url),
      );
    }
    return NextResponse.next();
  }

  // Everything outside the explicit private families remains public. This
  // includes metadata/static routes and intentionally public API handlers.
  return NextResponse.next();
});

function unconfiguredProxy(req: NextRequest) {
  if (isAdminApiRoute(req)) {
    return NextResponse.json(
      { error: "Authentication is not configured." },
      { status: 503 },
    );
  }

  if (isAdminRoute(req) || isDashboardRoute(req) || isAffiliatePortalRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
}

export default isClerkConfigured() ? configuredProxy : unconfiguredProxy;

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
