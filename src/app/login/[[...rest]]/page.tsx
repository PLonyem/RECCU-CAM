import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-primary-900 mt-3">Sign In</h1>
          <p className="text-sm text-gray-500 mt-1">Access your CamCCUL dashboard</p>
        </div>
        <SignIn
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
        />
        <p className="mt-5 text-center text-sm leading-6 text-gray-500">
          Access is provided by CamCCUL. Contact your chapter supervisor if you need an account.
        </p>
      </div>
    </div>
  );
}
