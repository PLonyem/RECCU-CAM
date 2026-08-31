import { redirect } from "next/navigation";

// The unified /login page now handles both admin and credit union sign-in
// (it checks the authenticated session's role and routes to /admin or
// /dashboard accordingly) — this route is kept only so old bookmarks/links
// to /admin/login still land somewhere useful.
export default function AdminLoginPage() {
  redirect("/login");
}
