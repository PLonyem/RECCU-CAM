import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { isClerkConfigured } from "@/lib/auth/config";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Secure sign in for authorised RECCU-CAM portal users.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function LoginPage() {
  const configured = isClerkConfigured();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-primary-900 mt-3">Sign In</h1>
          <p className="text-sm text-gray-500 mt-1">Access your RECCU-CAM portal</p>
        </div>
        {configured ? <SignIn
          routing="path"
          path="/login"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-lg rounded-xl border border-gray-200",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "!hidden",
              dividerRow: "!hidden",
              formFieldInput: "rounded-lg border-gray-300 focus:ring-2 focus:ring-primary-500",
              formButtonPrimary: "bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg",
              footerAction: "!hidden",
            },
          }}
        /> : (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <h2 className="font-display text-lg font-semibold text-primary-900">
              Authentication is not configured
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Portal access is temporarily unavailable. No authentication keys are exposed here.
            </p>
            <Link className="mt-5 inline-flex font-semibold text-primary-700 underline-offset-4 hover:underline" href="/">
              Return to the public website
            </Link>
          </div>
        )}
        <p className="mt-5 text-center text-sm leading-6 text-gray-500">
          Access is provided by RECCU-CAM. Contact your authorised network administrator if you need an account.
        </p>
      </div>
    </div>
  );
}
