import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  FilePenLine,
  FileText,
  Globe2,
  HandCoins,
  Headphones,
  Mail,
  Megaphone,
  ScrollText,
  Server,
  ShieldCheck,
} from "lucide-react";
import { AdminDashboardWelcome } from "@/components/admin/AdminDashboardWelcome";
import { Badge, type BadgeProps } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { requireStaffPermission } from "@/lib/auth/staff-context";
import { DEMO_ADMIN_IDENTITY, isDemoMode } from "@/lib/demo-mode";
import {
  AUTH_PERMISSIONS,
  hasPermission,
  ROLE_LABELS,
  type AuthPermission,
} from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

type SectionResult<T> =
  | { available: true; data: T }
  | { available: false; data: null };

function getErrorCode(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
    ? error.code
    : null;
}

async function loadSection<T>(label: string, query: () => Promise<T>): Promise<SectionResult<T>> {
  try {
    return { available: true, data: await query() };
  } catch (error) {
    const code = getErrorCode(error);
    console.error(`[admin-dashboard] ${label} unavailable${code ? ` (${code})` : ""}.`);
    return { available: false, data: null };
  }
}

function countStatuses(
  rows: Array<{ status: string; _count: { _all: number } }>,
  statuses: string[],
) {
  return rows
    .filter((row) => statuses.includes(row.status))
    .reduce((total, row) => total + row._count._all, 0);
}

function formatDate(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date)
    : "Not scheduled";
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function labelize(value: string) {
  return value.replaceAll("-", " ").replaceAll("_", " ");
}

function statusVariant(status: string): BadgeProps["variant"] {
  if (["active", "published", "operational", "connected", "responded", "resolved", "closed"].includes(status)) return "success";
  if (["urgent", "failed", "unavailable", "overdue"].includes(status)) return "error";
  if (["new", "submitted", "open", "in-review", "under-review", "in-progress", "upcoming"].includes(status)) return "warning";
  return "default";
}

function Panel({ title, description, action, children, className }: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("min-w-0 overflow-hidden", className)}>
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <h2 className="font-display text-xl font-bold text-institutional">{title}</h2>
          {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, description }: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
      <Icon className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
      <p className="mt-3 font-semibold text-slate-800">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function DataUnavailable() {
  return (
    <EmptyState
      icon={CircleAlert}
      title="Operational data unavailable"
      description="This module could not reach its data source. No placeholder figures are being displayed."
    />
  );
}

function StatCard({ label, value, detail, icon: Icon, href }: {
  label: string;
  value: number;
  detail: string;
  icon: LucideIcon;
  href: string;
}) {
  return (
    <Link href={href} className="group rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
      <Card className="h-full p-5 transition-[border-color,box-shadow,transform] group-hover:-translate-y-0.5 group-hover:border-primary-200 group-hover:shadow-raised">
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-forest">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-3xl font-bold tabular-nums text-institutional">{value}</span>
        </div>
        <h2 className="mt-5 font-semibold text-slate-900">{label}</h2>
        <p className="mt-1 text-sm text-slate-500">{detail}</p>
      </Card>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const role = isDemoMode()
    ? DEMO_ADMIN_IDENTITY.role
    : (await requireStaffPermission(AUTH_PERMISSIONS.accessAdmin)).role;
  const can = (permission: AuthPermission) => hasPermission(role, permission);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const messageRequest = can(AUTH_PERMISSIONS.manageMessages)
    ? loadSection("messages", async () => {
        const [newCount, receivedToday, recent] = await Promise.all([
          prisma.contactMessage.count({ where: { status: "new" } }),
          prisma.contactMessage.count({ where: { createdAt: { gte: startOfToday } } }),
          prisma.contactMessage.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            select: { id: true, name: true, organization: true, purpose: true, subject: true, status: true, createdAt: true },
          }),
        ]);
        return { newCount, receivedToday, recent };
      })
    : Promise.resolve(null);

  const affiliateRequest = can(AUTH_PERMISSIONS.manageNetwork)
    ? loadSection("affiliate network", async () => {
        const [active, inactive, recent] = await Promise.all([
          prisma.affiliate.count({ where: { isActive: true } }),
          prisma.affiliate.count({ where: { isActive: false } }),
          prisma.affiliate.findMany({
            orderBy: { updatedAt: "desc" },
            take: 4,
            select: { id: true, name: true, code: true, region: true, isActive: true, updatedAt: true },
          }),
        ]);
        return { active, inactive, recent };
      })
    : Promise.resolve(null);

  const affiliationRequest = can(AUTH_PERMISSIONS.manageAffiliationRequests)
    ? loadSection("affiliation requests", async () => ({
        pending: await prisma.affiliationInquiry.count({ where: { status: { in: ["new", "under-review"] } } }),
      }))
    : Promise.resolve(null);

  const trainingRequest = can(AUTH_PERMISSIONS.manageTraining)
    ? loadSection("VTIME", async () => {
        const [upcoming, drafts, completed, recentRegistrations, programs] = await Promise.all([
          prisma.trainingProgram.count({ where: { published: true, startDate: { gte: now } } }),
          prisma.trainingProgram.count({ where: { published: false } }),
          prisma.trainingProgram.count({ where: { published: true, endDate: { lt: now } } }),
          prisma.trainingRegistration.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
          prisma.trainingProgram.findMany({
            orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
            take: 5,
            select: {
              id: true,
              title: true,
              startDate: true,
              venue: true,
              published: true,
              registrationStatus: true,
              _count: { select: { registrations: true } },
            },
          }),
        ]);
        return { upcoming, drafts, completed, recentRegistrations, programs };
      })
    : Promise.resolve(null);

  const contentRequest = can(AUTH_PERMISSIONS.manageContent) || can(AUTH_PERMISSIONS.manageNews)
    ? loadSection("website content", async () => {
        const [draftNews, draftPages, homepage] = await Promise.all([
          can(AUTH_PERMISSIONS.manageNews) ? prisma.newsArticle.count({ where: { published: false } }) : Promise.resolve(0),
          can(AUTH_PERMISSIONS.manageContent) ? prisma.pageContent.count({ where: { status: "draft" } }) : Promise.resolve(0),
          can(AUTH_PERMISSIONS.manageContent)
            ? prisma.homepageContent.findUnique({ where: { id: "default" }, select: { publicationStatus: true, updatedAt: true } })
            : Promise.resolve(null),
        ]);
        return { draftNews, draftPages, homepage };
      })
    : Promise.resolve(null);

  const knowledgeRequest = can(AUTH_PERMISSIONS.manageKnowledge)
    ? loadSection("knowledge centre", async () => {
        const [groups, recent, circulars] = await Promise.all([
          prisma.resource.groupBy({
            by: ["accessLevel", "published"],
            where: { isActive: true },
            _count: { _all: true },
          }),
          prisma.resource.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            take: 4,
            select: { id: true, title: true, category: true, accessLevel: true, published: true, createdAt: true },
          }),
          prisma.announcement.count({ where: { category: "Circular", isPublished: true } }),
        ]);
        const count = (accessLevel: string, published: boolean) => groups
          .filter((group) => group.accessLevel === accessLevel && group.published === published)
          .reduce((total, group) => total + group._count._all, 0);
        return {
          publicCount: count("PUBLIC", true),
          affiliateCount: count("AFFILIATE_ONLY", true),
          draftCount: groups.filter((group) => !group.published).reduce((total, group) => total + group._count._all, 0),
          circulars,
          recent,
        };
      })
    : Promise.resolve(null);

  const bankingRequest = can(AUTH_PERMISSIONS.manageAffiliateBanking)
    ? loadSection("affiliate banking", async () => {
        const [groups, recent] = await Promise.all([
          prisma.affiliateBankingInquiry.groupBy({ by: ["status"], _count: { _all: true } }),
          prisma.affiliateBankingInquiry.findMany({
            orderBy: { createdAt: "desc" },
            take: 4,
            select: { id: true, reference: true, institution: true, supportCategory: true, status: true, createdAt: true },
          }),
        ]);
        return {
          newCount: countStatuses(groups, ["submitted"]),
          reviewCount: countStatuses(groups, ["under-review"]),
          informationCount: countStatuses(groups, ["more-information-required"]),
          closedCount: countStatuses(groups, ["closed", "approved", "declined"]),
          recent,
        };
      })
    : Promise.resolve(null);

  const noticeRequest = can(AUTH_PERMISSIONS.manageNotices)
    ? loadSection("notices", async () => {
        const activeWhere = {
          isPublished: true,
          OR: [{ startDate: null }, { startDate: { lte: now } }],
          AND: [{ OR: [{ expiryDate: null }, { expiryDate: { gt: now } }] }],
        };
        const [active, upcoming, expired, urgent, recent] = await Promise.all([
          prisma.announcement.count({ where: activeWhere }),
          prisma.announcement.count({ where: { isPublished: true, startDate: { gt: now } } }),
          prisma.announcement.count({ where: { expiryDate: { lte: now } } }),
          prisma.announcement.count({ where: { ...activeWhere, priority: "urgent" } }),
          prisma.announcement.findMany({
            orderBy: { createdAt: "desc" },
            take: 4,
            select: { id: true, title: true, audience: true, priority: true, startDate: true, expiryDate: true, isPublished: true },
          }),
        ]);
        return { active, upcoming, expired, urgent, recent };
      })
    : Promise.resolve(null);

  const supportRequest = can(AUTH_PERMISSIONS.manageSupport)
    ? loadSection("support", async () => {
        const [groups, recent] = await Promise.all([
          prisma.supportTicket.groupBy({ by: ["status"], _count: { _all: true } }),
          prisma.supportTicket.findMany({
            orderBy: { createdAt: "desc" },
            take: 4,
            select: {
              id: true,
              category: true,
              priority: true,
              status: true,
              assignedTo: true,
              affiliate: { select: { name: true } },
            },
          }),
        ]);
        return {
          open: countStatuses(groups, ["open"]),
          inProgress: countStatuses(groups, ["in-progress"]),
          resolved: countStatuses(groups, ["resolved", "closed"]),
          recent,
        };
      })
    : Promise.resolve(null);

  const activityRequest = can(AUTH_PERMISSIONS.viewAuditLog)
    ? loadSection("audit activity", () => prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, actorId: true, actorRole: true, action: true, resource: true, createdAt: true },
      }))
    : Promise.resolve(null);

  const [messages, affiliates, affiliations, training, content, knowledge, banking, notices, support, activity] = await Promise.all([
    messageRequest,
    affiliateRequest,
    affiliationRequest,
    trainingRequest,
    contentRequest,
    knowledgeRequest,
    bankingRequest,
    noticeRequest,
    supportRequest,
    activityRequest,
  ]);

  const summaryCards: Array<{ label: string; value: number; detail: string; icon: LucideIcon; href: string }> = [];
  if (messages?.available) summaryCards.push({ label: "New Contact Messages", value: messages.data.newCount, detail: messages.data.receivedToday ? `${messages.data.receivedToday} received today` : "No messages received today", icon: Mail, href: "/admin/messages" });
  if (affiliations?.available) summaryCards.push({ label: "Pending Affiliation Requests", value: affiliations.data.pending, detail: affiliations.data.pending ? "Awaiting staff review" : "No institutions awaiting review", icon: ClipboardList, href: "/admin/affiliation-requests" });
  if (affiliates?.available) summaryCards.push({ label: "Active Affiliates", value: affiliates.data.active, detail: "Current operational records", icon: Building2, href: "/admin/affiliates" });
  if (training?.available) summaryCards.push({ label: "Upcoming VTIME Programs", value: training.data.upcoming, detail: training.data.upcoming ? "Published with future dates" : "No scheduled programmes", icon: CalendarDays, href: "/admin/vtime" });
  if (content?.available) summaryCards.push({ label: "Draft Publications", value: content.data.draftNews + content.data.draftPages, detail: "Not yet published", icon: FilePenLine, href: "/admin/content" });
  if (support?.available) summaryCards.push({ label: "Open Support Requests", value: support.data.open + support.data.inProgress, detail: "Open or in progress", icon: Headphones, href: "/admin/support" });
  if (banking?.available) summaryCards.push({ label: "Affiliate Banking Inquiries", value: banking.data.newCount, detail: "New institutional inquiries", icon: HandCoins, href: "/admin/affiliate-banking" });
  if (notices?.available) summaryCards.push({ label: "Active Notices", value: notices.data.active, detail: notices.data.urgent ? `${notices.data.urgent} marked urgent` : "Currently published", icon: Megaphone, href: "/admin/notices" });

  const quickActions = [
    { label: "Edit Homepage", href: "/admin/homepage", permission: AUTH_PERMISSIONS.manageContent, icon: Globe2 },
    { label: "Update Leadership", href: "/admin/content/homepage-sections", permission: AUTH_PERMISSIONS.manageContent, icon: FilePenLine },
    { label: "Edit Contact Information", href: "/admin/settings/organization", permission: AUTH_PERMISSIONS.manageSettings, icon: Building2 },
    { label: "Publish Notice", href: "/admin/notices", permission: AUTH_PERMISSIONS.manageNotices, icon: Megaphone },
    { label: "Create News Article", href: "/admin/news/new", permission: AUTH_PERMISSIONS.manageNews, icon: FileText },
    { label: "Add Affiliate", href: "/admin/affiliates/new", permission: AUTH_PERMISSIONS.manageNetwork, icon: Building2 },
    { label: "Review Affiliation Request", href: "/admin/affiliation-requests", permission: AUTH_PERMISSIONS.manageAffiliationRequests, icon: ClipboardList },
    { label: "Create VTIME Program", href: "/admin/vtime", permission: AUTH_PERMISSIONS.manageTraining, icon: CalendarDays },
    { label: "Upload Knowledge Document", href: "/admin/resources/new", permission: AUTH_PERMISSIONS.manageKnowledge, icon: BookOpenCheck },
    { label: "View Messages", href: "/admin/messages", permission: AUTH_PERMISSIONS.manageMessages, icon: Mail },
  ].filter((action) => can(action.permission));

  const databaseConnected = [messages, affiliates, affiliations, training, content, knowledge, banking, notices, support, activity]
    .some((section) => section?.available);
  const storageConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const deploymentSha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-institutional px-5 py-7 text-white shadow-raised sm:px-8 sm:py-9">
        <div aria-hidden="true" className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10" />
        <div className="relative [&_.text-institutional]:text-white [&_.text-slate-600]:text-primary-100">
          <AdminDashboardWelcome roleLabel={ROLE_LABELS[role]} />
        </div>
      </section>

      {summaryCards.length > 0 && (
        <section aria-labelledby="summary-heading">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="summary-heading" className="font-display text-xl font-bold text-institutional">Executive summary</h2>
            <p className="hidden text-xs text-slate-500 sm:block">Live stored records</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => <StatCard key={card.label} {...card} />)}
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {(content || knowledge || training || notices) && (
          <Panel title="Website Status" description="Publication indicators from the active content stores.">
            {content?.available || knowledge?.available || training?.available || notices?.available ? (
              <div className="divide-y divide-slate-200 border-y border-slate-200">
                {content?.available && can(AUTH_PERMISSIONS.manageContent) && <StatusRow label="Homepage" value={content.data.homepage?.publicationStatus === "published" ? "Published" : content.data.homepage ? "Draft" : "Default content"} />}
                {content?.available && can(AUTH_PERMISSIONS.manageNews) && <StatusRow label="News & Events" value={`${content.data.draftNews} draft${content.data.draftNews === 1 ? "" : "s"}`} />}
                {knowledge?.available && <StatusRow label="Knowledge Centre" value={`${knowledge.data.publicCount + knowledge.data.affiliateCount} published documents`} />}
                {training?.available && <StatusRow label="VTIME" value={`${training.data.upcoming} upcoming programme${training.data.upcoming === 1 ? "" : "s"}`} />}
                {notices?.available && <StatusRow label="Official Notices" value={`${notices.data.active} active`} />}
                <StatusRow label="Contact Form" value="Route active" />
              </div>
            ) : <DataUnavailable />}
          </Panel>
        )}

        <Panel title="Quick Actions" description="Go directly to the tools available for your role.">
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href} className="group flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-primary-200 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest">
                <Icon className="h-4 w-4 text-forest" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      {messages && (
        <Panel title="Recent Contact Messages" description="The five most recent public website inquiries." action={<PanelLink href="/admin/messages">Open Inbox</PanelLink>}>
          {!messages.available ? <DataUnavailable /> : messages.data.recent.length === 0 ? (
            <EmptyState icon={Mail} title="No contact messages" description="New public inquiries will appear here when they are received." />
          ) : <ContactMessages rows={messages.data.recent} />}
        </Panel>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {affiliates && (
          <Panel title="Affiliate Network" description="Current institutions and recently maintained records." action={<PanelLink href="/admin/affiliates">View All Affiliates</PanelLink>}>
            {!affiliates.available ? <DataUnavailable /> : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <MiniMetric label="Active affiliates" value={affiliates.data.active} />
                  <MiniMetric label="Inactive / archived" value={affiliates.data.inactive} />
                  {affiliations?.available && <MiniMetric label="Pending requests" value={affiliations.data.pending} className="col-span-2" />}
                </div>
                <div className="mt-5 space-y-3">
                  {affiliates.data.recent.map((affiliate) => (
                    <div key={affiliate.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
                      <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{affiliate.name}</p><p className="mt-1 text-xs text-slate-500">{affiliate.code} · {affiliate.region}</p></div>
                      <Badge variant={affiliate.isActive ? "success" : "default"}>{affiliate.isActive ? "Active" : "Inactive"}</Badge>
                    </div>
                  ))}
                  {affiliates.data.recent.length === 0 && <p className="text-sm text-slate-500">No affiliate records are available.</p>}
                </div>
              </>
            )}
          </Panel>
        )}

        {training && (
          <Panel title="VTIME Overview" description="Programmes and registration activity." action={<PanelLink href="/admin/vtime">Manage VTIME</PanelLink>}>
            {!training.available ? <DataUnavailable /> : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MiniMetric label="Upcoming" value={training.data.upcoming} />
                  <MiniMetric label="30-day registrations" value={training.data.recentRegistrations} />
                  <MiniMetric label="Drafts" value={training.data.drafts} />
                  <MiniMetric label="Completed" value={training.data.completed} />
                </div>
                {training.data.programs.length ? (
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[34rem] text-left text-sm">
                      <thead className="text-xs uppercase tracking-wide text-slate-500"><tr><th className="pb-3 font-semibold">Program</th><th className="pb-3 font-semibold">Date</th><th className="pb-3 font-semibold">Location</th><th className="pb-3 text-right font-semibold">Registrations</th></tr></thead>
                      <tbody className="divide-y divide-slate-200">{training.data.programs.map((program) => <tr key={program.id}><td className="py-3 pr-4 font-semibold text-slate-900">{program.title}</td><td className="py-3 pr-4 text-slate-600">{formatDate(program.startDate)}</td><td className="py-3 pr-4 text-slate-600">{program.venue || "Not confirmed"}</td><td className="py-3 text-right tabular-nums text-slate-700">{program._count.registrations}</td></tr>)}</tbody>
                    </table>
                  </div>
                ) : <div className="mt-5"><EmptyState icon={CalendarDays} title="No VTIME programmes" description="Create a programme when delivery details are ready for staff review." /></div>}
              </>
            )}
          </Panel>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {knowledge && (
          <Panel title="Knowledge & Compliance" description="Publication and access classification overview." action={<PanelLink href="/admin/knowledge">Manage Library</PanelLink>}>
            {!knowledge.available ? <DataUnavailable /> : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MiniMetric label="Public" value={knowledge.data.publicCount} />
                  <MiniMetric label="Affiliate only" value={knowledge.data.affiliateCount} />
                  <MiniMetric label="Draft documents" value={knowledge.data.draftCount} />
                  <MiniMetric label="Circulars" value={knowledge.data.circulars} />
                </div>
                <div className="mt-5 space-y-3">{knowledge.data.recent.map((resource) => <div key={resource.id} className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3 last:border-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{resource.title}</p><p className="mt-1 text-xs text-slate-500">{resource.category} · {labelize(resource.accessLevel)}</p></div><Badge variant={resource.published ? "success" : "default"}>{resource.published ? "Published" : "Draft"}</Badge></div>)}</div>
                {knowledge.data.recent.length === 0 && <div className="mt-5"><EmptyState icon={BookOpenCheck} title="No knowledge documents" description="Approved resources will appear here after they are added." /></div>}
              </>
            )}
          </Panel>
        )}

        {banking && (
          <Panel title="Affiliate Banking" description="Institutional service inquiries only; no balances or transactions." action={<PanelLink href="/admin/affiliate-banking">View Inquiries</PanelLink>}>
            {!banking.available ? <DataUnavailable /> : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MiniMetric label="New" value={banking.data.newCount} />
                  <MiniMetric label="Under review" value={banking.data.reviewCount} />
                  <MiniMetric label="More information" value={banking.data.informationCount} />
                  <MiniMetric label="Closed" value={banking.data.closedCount} />
                </div>
                <div className="mt-5 space-y-3">{banking.data.recent.map((inquiry) => <div key={inquiry.id} className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3 last:border-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{inquiry.institution}</p><p className="mt-1 text-xs text-slate-500">{inquiry.reference} · {inquiry.supportCategory}</p></div><Badge variant={statusVariant(inquiry.status)}>{labelize(inquiry.status)}</Badge></div>)}</div>
                {banking.data.recent.length === 0 && <div className="mt-5"><EmptyState icon={HandCoins} title="No banking inquiries" description="New institutional service requests will appear here." /></div>}
              </>
            )}
          </Panel>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {notices && (
          <Panel title="Official Notices" description="Current publication schedule and priority." action={<PanelLink href="/admin/notices">Manage Notices</PanelLink>}>
            {!notices.available ? <DataUnavailable /> : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><MiniMetric label="Active" value={notices.data.active} /><MiniMetric label="Upcoming" value={notices.data.upcoming} /><MiniMetric label="Expired" value={notices.data.expired} /><MiniMetric label="Urgent" value={notices.data.urgent} /></div>
                <div className="mt-5 space-y-3">{notices.data.recent.map((notice) => <div key={notice.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><p className="font-semibold text-slate-900">{notice.title}</p><Badge variant={statusVariant(notice.priority)}>{notice.priority}</Badge></div><p className="mt-2 text-xs text-slate-500">{labelize(notice.audience)} · {formatDate(notice.startDate)} – {formatDate(notice.expiryDate)}</p></div>)}</div>
                {notices.data.recent.length === 0 && <div className="mt-5"><EmptyState icon={Megaphone} title="No official notices" description="There are no draft or published notices to display." /></div>}
              </>
            )}
          </Panel>
        )}

        {support && (
          <Panel title="Affiliate Support" description="Open workload and recently submitted tickets." action={<PanelLink href="/admin/support">View Tickets</PanelLink>}>
            {!support.available ? <DataUnavailable /> : (
              <>
                <div className="grid grid-cols-3 gap-3"><MiniMetric label="Open" value={support.data.open} /><MiniMetric label="In progress" value={support.data.inProgress} /><MiniMetric label="Resolved" value={support.data.resolved} /></div>
                <div className="mt-5 space-y-3">{support.data.recent.map((ticket) => <div key={ticket.id} className="grid gap-2 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_auto] sm:items-start"><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{ticket.affiliate.name}</p><p className="mt-1 text-xs text-slate-500">{ticket.category} · {ticket.priority} priority</p><p className="mt-1 text-xs text-slate-500">Assigned: {ticket.assignedTo || "Unassigned"}</p></div><Badge variant={statusVariant(ticket.status)}>{labelize(ticket.status)}</Badge></div>)}</div>
                {support.data.recent.length === 0 && <div className="mt-5"><EmptyState icon={Headphones} title="No support requests" description="There are currently no affiliate support tickets." /></div>}
              </>
            )}
          </Panel>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {activity && (
          <Panel title="Recent Activity" description="Latest non-sensitive administrative audit events." action={<PanelLink href="/admin/audit-log">Open Audit Log</PanelLink>}>
            {!activity.available ? <DataUnavailable /> : activity.data.length === 0 ? (
              <EmptyState icon={ScrollText} title="No audit activity" description="Recorded administrative changes will appear here." />
            ) : <div className="divide-y divide-slate-200">{activity.data.map((entry) => <div key={entry.id} className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto]"><div><p className="text-sm font-semibold text-slate-900">{labelize(entry.action)}</p><p className="mt-1 text-xs text-slate-500">{labelize(entry.actorRole)} · Staff {entry.actorId.slice(-6)} · {labelize(entry.resource)}</p></div><time className="text-xs text-slate-500" dateTime={entry.createdAt.toISOString()}>{formatTime(entry.createdAt)}</time></div>)}</div>}
          </Panel>
        )}

        <Panel title="Platform Status" description="Signals reliably available to this running application.">
          <div className="space-y-3">
            <HealthRow icon={Globe2} label="Public application" value="Running" healthy />
            <HealthRow icon={ShieldCheck} label="Authentication" value="Session verified" healthy />
            <HealthRow icon={Server} label="Database" value={databaseConnected ? "Connected" : "Unavailable"} healthy={databaseConnected} />
            <HealthRow icon={FileText} label="Document storage" value={storageConfigured ? "Configured" : "Not configured"} healthy={storageConfigured} />
            {deploymentSha && <HealthRow icon={Activity} label="Deployment" value={deploymentSha} healthy />}
          </div>
        </Panel>
      </div>

      <Card className="border-l-4 border-l-gold p-5 sm:p-6">
        <div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" /><div><h2 className="font-semibold text-institutional">Verified operational data</h2><p className="mt-1 text-sm leading-6 text-slate-600">Dashboard figures are calculated from stored records available to your role. No financial balances, regulatory deadlines, or unverified institutional statistics are fabricated.</p></div></div>
      </Card>
    </div>
  );
}

function PanelLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className={buttonVariants({ variant: "secondary", size: "sm", className: "shrink-0" })}>{children}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>;
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 py-3"><span className="text-sm font-semibold text-slate-800">{label}</span><span className="text-right text-sm text-slate-500">{value}</span></div>;
}

function MiniMetric({ label, value, className }: { label: string; value: number; className?: string }) {
  return <div className={cn("rounded-xl bg-slate-50 p-3", className)}><p className="font-display text-2xl font-bold tabular-nums text-institutional">{value}</p><p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p></div>;
}

function HealthRow({ icon: Icon, label, value, healthy }: { icon: LucideIcon; label: string; value: string; healthy: boolean }) {
  return <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3"><span className={cn("grid h-9 w-9 place-items-center rounded-lg", healthy ? "bg-primary-50 text-forest" : "bg-amber-50 text-amber-700")}><Icon className="h-4 w-4" aria-hidden="true" /></span><span className="min-w-0 flex-1 text-sm font-semibold text-slate-800">{label}</span><span className="text-right text-xs text-slate-500">{value}</span></div>;
}

function ContactMessages({ rows }: {
  rows: Array<{ id: string; name: string; organization: string | null; purpose: string; subject: string; status: string; createdAt: Date }>;
}) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {rows.map((message) => <article key={message.id} className={cn("rounded-xl border p-4", message.status === "new" ? "border-primary-200 bg-primary-50/60" : "border-slate-200")}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{message.name}</p><p className="mt-1 text-xs text-slate-500">{message.organization || "No organization provided"}</p></div><Badge variant={statusVariant(message.status)}>{labelize(message.status)}</Badge></div><p className="mt-3 text-sm font-medium text-slate-800">{message.subject}</p><p className="mt-2 text-xs text-slate-500">{labelize(message.purpose)} · {formatDate(message.createdAt)}</p></article>)}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[50rem] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="pb-3 font-semibold">Sender</th><th className="pb-3 font-semibold">Organization</th><th className="pb-3 font-semibold">Purpose</th><th className="pb-3 font-semibold">Subject</th><th className="pb-3 font-semibold">Date</th><th className="pb-3 text-right font-semibold">Status</th></tr></thead>
          <tbody className="divide-y divide-slate-200">{rows.map((message) => <tr key={message.id} className={message.status === "new" ? "bg-primary-50/50" : undefined}><td className="py-3 pr-4 font-semibold text-slate-900">{message.name}</td><td className="py-3 pr-4 text-slate-600">{message.organization || "—"}</td><td className="py-3 pr-4 capitalize text-slate-600">{labelize(message.purpose)}</td><td className="max-w-64 truncate py-3 pr-4 text-slate-700">{message.subject}</td><td className="whitespace-nowrap py-3 pr-4 text-slate-500">{formatDate(message.createdAt)}</td><td className="py-3 text-right"><Badge variant={statusVariant(message.status)}>{labelize(message.status)}</Badge></td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}
