import Link from "next/link";
import { notFound } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import { CalendarDays, Download, ExternalLink, FileText, Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAffiliateSession } from "@/lib/auth/affiliate-context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BankingInquiryForm, ProfileUpdateForm, SupportRequestForm } from "@/components/portal/PortalForms";

const validSections = ["institution-profile", "compliance", "documents", "circulars", "vtime", "affiliate-banking", "support", "notices", "account"] as const;
type Section = (typeof validSections)[number];

function Header({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">{eyebrow}</p><h1 className="mt-2 font-display text-3xl font-bold text-institutional">{title}</h1><p className="mt-2 max-w-3xl text-slate-600">{description}</p></header>;
}

function Empty({ title, description }: { title: string; description: string }) {
  return <Card className="p-10 text-center"><Inbox className="mx-auto h-9 w-9 text-slate-300" /><h2 className="mt-4 font-semibold text-slate-800">{title}</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p></Card>;
}

function statusLabel(status: string) { return status.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value: Date | null) { return value ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(value) : "To be confirmed"; }

export default async function AffiliatePortalSection({ params }: { params: Promise<{ section: string }> }) {
  const { section: rawSection } = await params;
  if (!validSections.includes(rawSection as Section)) notFound();
  const section = rawSection as Section;
  const session = await getAffiliateSession();
  if (!session) return null;
  const affiliate = await prisma.affiliate.findUnique({ where: { id: session.affiliateId }, include: { chapter: { select: { name: true } } } });
  if (!affiliate) return null;

  if (section === "institution-profile") {
    const requests = await prisma.affiliateUpdateRequest.findMany({ where: { affiliateId: affiliate.id }, orderBy: { createdAt: "desc" }, take: 5 });
    return <div className="space-y-8"><Header eyebrow="Institution" title="Institution Profile" description="Review the verified institutional record and submit proposed changes for RECCU-CAM approval." />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><Card className="p-6"><h2 className="font-display text-xl font-semibold text-institutional">Verified profile</h2><dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
        {[["Institution", affiliate.name],["Acronym / code", affiliate.code],["Region", affiliate.region],["Chapter", affiliate.chapter?.name ?? affiliate.chapterName ?? "Not assigned"],["City", affiliate.city ?? "Not published"],["Address", affiliate.address ?? "Not published"],["Telephone", affiliate.phone ?? "Not published"],["Email", affiliate.email ?? "Not published"],["Website", affiliate.website ?? "Not published"]].map(([label,value]) => <div key={label}><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 font-medium text-slate-800">{value}</dd></div>)}
        <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Services</dt><dd className="mt-2 flex flex-wrap gap-2">{affiliate.services.length ? affiliate.services.map((service) => <Badge key={service}>{service}</Badge>) : "Not published"}</dd></div>
      </dl></Card><Card className="p-6"><h2 className="font-display text-xl font-semibold text-institutional">Request an update</h2><p className="mt-2 mb-5 text-sm text-slate-500">Submitting this form does not directly change verified public information.</p><ProfileUpdateForm initial={{ address: affiliate.address ?? "", city: affiliate.city ?? "", phone: affiliate.phone ?? "", email: affiliate.email ?? "", website: affiliate.website ?? "", description: affiliate.description ?? "" }} /></Card></div>
      <section><h2 className="mb-3 font-semibold text-institutional">Recent update requests</h2>{requests.length ? <Card className="divide-y divide-slate-100">{requests.map((request) => <div key={request.id} className="flex items-center justify-between gap-4 p-4"><div><p className="text-sm font-medium text-slate-800">Submitted {formatDate(request.createdAt)}</p><p className="mt-1 text-xs text-slate-500">Reference {request.id.slice(-8).toUpperCase()}</p></div><Badge>{statusLabel(request.status)}</Badge></div>)}</Card> : <Empty title="No update requests" description="Requests submitted here will appear in this history while RECCU-CAM reviews them." />}</section>
    </div>;
  }

  if (section === "compliance") {
    const records = await prisma.complianceRecord.findMany({ where: { published: true, OR: [{ affiliateId: null }, { affiliateId: affiliate.id }] }, orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }] });
    return <div className="space-y-8"><Header eyebrow="Institutional workspace" title="Compliance" description="Published notices, submissions, deadlines, and resources assigned to your institution. No unverified regulatory obligations are displayed." />{records.length ? <div className="grid gap-4">{records.map((record) => <Card key={record.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-gold-strong">{record.category}</p><h2 className="mt-1 font-semibold text-institutional">{record.title}</h2></div><Badge>{statusLabel(record.status)}</Badge></div><p className="mt-3 text-sm leading-6 text-slate-600">{record.description}</p><p className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500"><CalendarDays className="h-4 w-4" />{formatDate(record.dueDate)}</p></Card>)}</div> : <Empty title="No published compliance items" description="Verified deadlines and required submissions will appear only after authorized RECCU-CAM staff publish them." />}</div>;
  }

  if (section === "documents") {
    const documents = await prisma.resource.findMany({ where: { isActive: true, published: true, accessLevel: { in: ["PUBLIC", "AFFILIATE_ONLY"] } }, orderBy: { updatedAt: "desc" } });
    return <div className="space-y-8"><Header eyebrow="Knowledge and compliance" title="Documents" description="Searchable public and affiliate-only resources. Staff-only documents are excluded by the server query." />{documents.length ? <div className="grid gap-4 md:grid-cols-2">{documents.map((document) => <Card key={document.id} className="p-5"><div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-forest"><FileText className="h-5 w-5" /></span><div className="min-w-0"><div className="flex flex-wrap gap-2"><Badge>{document.accessLevel === "PUBLIC" ? "Public" : "Affiliate Only"}</Badge><Badge>{document.category}</Badge></div><h2 className="mt-3 font-semibold text-institutional">{document.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{document.description}</p>{document.fileUrl && <a href={document.fileUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline"><Download className="h-4 w-4" />Open document</a>}</div></div></Card>)}</div> : <Empty title="No documents published" description="Documents will appear here when authorized staff publish resources for public or affiliate access." />}</div>;
  }

  if (section === "circulars" || section === "notices") {
    const category = section === "circulars" ? "Circular" : undefined;
    const rows = await prisma.announcement.findMany({ where: { isPublished: true, ...(category ? { category } : {}), audience: { in: ["PUBLIC", "ALL_AFFILIATES", "SPECIFIC_AFFILIATE"] }, OR: [{ affiliateId: null }, { affiliateId: affiliate.id }], AND: [{ OR: [{ startDate: null }, { startDate: { lte: new Date() } }] }, { OR: [{ expiryDate: null }, { expiryDate: { gt: new Date() } }] }] }, orderBy: { publishedAt: "desc" } });
    const title = section === "circulars" ? "Circulars" : "Official Notices";
    return <div className="space-y-8"><Header eyebrow="Official communications" title={title} description="Published RECCU-CAM communications available to your institution." />{rows.length ? <div className="space-y-4">{rows.map((row) => <Card key={row.id} className="p-5"><div className="flex flex-wrap items-center gap-2"><Badge>{row.category}</Badge><Badge>{statusLabel(row.priority)}</Badge></div><h2 className="mt-3 font-display text-xl font-semibold text-institutional">{row.title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{row.opening}</p><p className="mt-4 text-xs text-slate-500">Issued {formatDate(row.publishedAt)}</p></Card>)}</div> : <Empty title={`No ${title.toLowerCase()} available`} description="Official communications will appear here after publication." />}</div>;
  }

  if (section === "vtime") {
    const [programs, registrations] = await Promise.all([prisma.trainingProgram.findMany({ where: { published: true }, orderBy: [{ startDate: "asc" }, { title: "asc" }] }), prisma.trainingRegistration.findMany({ where: { affiliateId: affiliate.id }, include: { program: { select: { title: true } } }, orderBy: { createdAt: "desc" }, take: 10 })]);
    return <div className="space-y-8"><Header eyebrow="Professional development" title="VTIME Training" description="Published programs, upcoming sessions, registration status, and institutional participation." />{programs.length ? <div className="grid gap-4 md:grid-cols-2">{programs.map((program) => <Card key={program.id} className="p-5"><Badge>{statusLabel(program.registrationStatus)}</Badge><h2 className="mt-3 font-semibold text-institutional">{program.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{program.summary}</p><p className="mt-4 text-xs font-medium text-slate-500">{formatDate(program.startDate)} · {program.format ? statusLabel(program.format) : "Format pending"}</p><Link href={`/vtime/registration?program=${program.slug}`} className="mt-4 inline-flex text-sm font-semibold text-forest hover:underline">Registration details <ExternalLink className="ml-1 h-4 w-4" /></Link></Card>)}</div> : <Empty title="No scheduled programs" description="Only verified and published VTIME programs are shown. Public curriculum previews remain available on the VTIME website." />}{registrations.length > 0 && <section><h2 className="mb-3 font-semibold text-institutional">Recent registrations</h2><Card className="divide-y divide-slate-100">{registrations.map((registration) => <div key={registration.id} className="flex justify-between gap-4 p-4 text-sm"><span><strong className="block text-slate-800">{registration.participantName}</strong><span className="text-slate-500">{registration.program.title}</span></span><Badge>{statusLabel(registration.status)}</Badge></div>)}</Card></section>}</div>;
  }

  if (section === "support") {
    const tickets = await prisma.supportTicket.findMany({ where: { affiliateId: affiliate.id }, orderBy: { createdAt: "desc" } });
    return <div className="space-y-8"><Header eyebrow="Institutional assistance" title="Support Requests" description="Create and track support requests with the appropriate RECCU-CAM team." /><div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"><Card className="p-6"><h2 className="mb-5 font-display text-xl font-semibold text-institutional">New support request</h2><SupportRequestForm /></Card><section><h2 className="mb-3 font-semibold text-institutional">Request history</h2>{tickets.length ? <Card className="divide-y divide-slate-100">{tickets.map((ticket) => <div key={ticket.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-800">{ticket.subject}</p><p className="mt-1 text-xs text-slate-500">{ticket.reference} · {statusLabel(ticket.category)}</p></div><Badge>{statusLabel(ticket.status)}</Badge></div>{ticket.response && <p className="mt-3 rounded-lg bg-primary-50 p-3 text-sm text-slate-700"><strong>RECCU-CAM response:</strong> {ticket.response}</p>}</div>)}</Card> : <Empty title="No support requests" description="New tickets and their progress will appear here." />}</section></div></div>;
  }

  if (section === "affiliate-banking") {
    const inquiries = await prisma.affiliateBankingInquiry.findMany({ where: { affiliateId: affiliate.id }, orderBy: { createdAt: "desc" } });
    return <div className="space-y-8"><Header eyebrow="Institutional service" title="Affiliate Banking" description="Submit and track institutional service inquiries. This workspace does not process transfers, payments, balances, or loan transactions." /><div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"><Card className="p-6"><h2 className="mb-2 font-display text-xl font-semibold text-institutional">New inquiry</h2><p className="mb-5 text-sm leading-6 text-slate-500">Describe the support your institution requires. A RECCU-CAM officer can review and respond through the managed workflow.</p><BankingInquiryForm /></Card><section><h2 className="mb-3 font-semibold text-institutional">Inquiry history</h2>{inquiries.length ? <Card className="divide-y divide-slate-100">{inquiries.map((inquiry) => <div key={inquiry.id} className="flex items-start justify-between gap-3 p-4"><div><p className="font-semibold text-slate-800">{inquiry.supportCategory}</p><p className="mt-1 text-xs text-slate-500">{inquiry.reference} · {formatDate(inquiry.createdAt)}</p></div><Badge>{statusLabel(inquiry.status)}</Badge></div>)}</Card> : <Empty title="No banking inquiries" description="Submitted institutional inquiries will appear here. No financial balances are simulated." />}</section></div></div>;
  }

  if (section === "account") return <div className="space-y-8"><Header eyebrow="Identity and security" title="Account" description="Manage your Clerk-authenticated account and security settings. RECCU-CAM never displays or stores your password." /><UserProfile routing="hash" /></div>;
  notFound();
}
