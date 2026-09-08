"use client";

import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/Badge";
import { DEMO_ADMIN_IDENTITY, isDemoMode } from "@/lib/demo-mode";
import { AdminText } from "@/components/admin/AdminText";

export function AdminDashboardWelcome({ roleLabel }: { roleLabel: string }) {
  if (isDemoMode()) {
    return <Welcome name={DEMO_ADMIN_IDENTITY.name} roleLabel={DEMO_ADMIN_IDENTITY.roleLabel} />;
  }

  return <AuthenticatedWelcome roleLabel={roleLabel} />;
}

function AuthenticatedWelcome({ roleLabel }: { roleLabel: string }) {
  const { user } = useUser();
  const name = user?.firstName || user?.fullName || "colleague";

  return <Welcome name={name} roleLabel={roleLabel} />;
}

function Welcome({ name, roleLabel }: { name: string; roleLabel: string }) {
  return (
    <div>
      <Badge variant="accent"><AdminText value={roleLabel} /></Badge>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-institutional sm:text-4xl">
        <AdminText translationKey="admin.dashboard.welcome" replacements={{ name }} />
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
        <AdminText translationKey="admin.dashboard.state" />
      </p>
    </div>
  );
}
