import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { updateOperationalRecord } from "@/app/admin/(dashboard)/operations/actions";

export interface OperationalRow {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  status: string;
  assignedTo?: string | null;
  receivedAt: Date;
}

export function OperationalQueue({ kind, rows, statuses, emptyText }: { kind: "message" | "affiliation" | "support" | "banking"; rows: OperationalRow[]; statuses: readonly string[]; emptyText: string }) {
  if (!rows.length) return <Card className="p-10 text-center text-sm text-slate-500">{emptyText}</Card>;
  return <div className="space-y-4">{rows.map((row) => <Card key={row.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">{row.title}</h2><p className="mt-1 text-sm text-slate-500">{row.subtitle}</p></div><Badge>{row.status.replaceAll("-", " ")}</Badge></div><p className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">{row.detail}</p><p className="mt-3 text-xs text-slate-400">Received {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(row.receivedAt)}</p>
    <form action={updateOperationalRecord} className="mt-5 grid gap-3 border-t border-slate-100 pt-5 md:grid-cols-[180px_1fr_1.4fr_auto] md:items-end"><input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={row.id} /><label className="text-xs font-semibold text-slate-600">Status<select name="status" defaultValue={row.status} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("-", " ")}</option>)}</select></label><label className="text-xs font-semibold text-slate-600">Assigned staff<input name="assignedTo" defaultValue={row.assignedTo ?? ""} placeholder="Name or team" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label><label className="text-xs font-semibold text-slate-600">Internal note<input name="note" placeholder="Never shown publicly" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label><button className="rounded-lg bg-institutional px-4 py-2 text-sm font-semibold text-white hover:bg-forest">Update</button></form></Card>)}</div>;
}
