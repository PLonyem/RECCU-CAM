import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Newspaper, CheckCircle2, Building2, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { T } from "@/components/admin/T";

const statCardColors = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  teal: "bg-teal-50 text-teal-600",
  amber: "bg-amber-50 text-amber-600",
} as const;

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
}: {
  label: ReactNode;
  value: number;
  icon: LucideIcon;
  color: keyof typeof statCardColors;
  href?: string;
}) {
  const content = (
    <Card className="p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${statCardColors[color]}`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block hover:opacity-90 transition-opacity">
      {content}
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const [totalArticles, publishedArticles, totalAffiliates, unreadMessages] =
    await Promise.all([
      prisma.newsArticle.count(),
      prisma.newsArticle.count({ where: { published: true } }),
      prisma.affiliate.count(),
      prisma.contactMessage.count({ where: { isRead: false } }),
    ]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={<T k="admin.totalArticles" />}
          value={totalArticles}
          icon={Newspaper}
          color="blue"
          href="/admin/news"
        />
        <StatCard
          label={<T k="admin.published" />}
          value={publishedArticles}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label={<T k="admin.totalAffiliates" />}
          value={totalAffiliates}
          icon={Building2}
          color="teal"
          href="/admin/affiliates"
        />
        <StatCard
          label={<T k="admin.unreadMessages" />}
          value={unreadMessages}
          icon={Mail}
          color="amber"
          href="/admin/messages"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          <T k="admin.quickActions" />
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/news/new"
            className={buttonVariants({ variant: "default" })}
          >
            <T k="admin.newArticle" />
          </Link>
          <Link
            href="/admin/affiliates/new"
            className={buttonVariants({ variant: "outline" })}
          >
            <T k="admin.addAffiliate" />
          </Link>
          <Link
            href="/admin/messages"
            className={buttonVariants({ variant: "outline" })}
          >
            <T k="admin.viewMessages" />
          </Link>
        </div>
      </div>
    </div>
  );
}
