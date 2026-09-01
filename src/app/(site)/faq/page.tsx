import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = { title: "Frequently asked questions" };
const questions = [
  ["What is RECCU-CAM?", "RECCU-CAM LTD is the Union of Renaissance Cooperative Credit Unions in Cameroon Ltd, listed by Cameroon’s Ministry of Finance as a network headquartered in Bamenda."],
  ["Can I open an account with RECCU-CAM through this website?", "No account-opening service is published on this platform. Use the source-labelled directory to identify an affiliate, then confirm services directly through that institution’s verified channels."],
  ["Are the affiliate directory and map complete?", "No. They are a carefully labelled starter directory based on a public MINFI source as at 31 December 2021. They must not be interpreted as a current membership total."],
  ["Are VTIME dates available?", "Not yet. The programme architecture is visible, but no date is published until RECCU-CAM confirms the schedule, venue, facilitator, and registration process."],
  ["Where can I find official templates?", "The Knowledge Centre will publish controlled documents with version and source information. Placeholder files are never presented as official documents."],
] as const;

export default function FaqPage() {
  return <><PageIntro eyebrow="Help" title="Clear answers, careful claims." description="These answers describe the current platform without inventing services, rates, dates, or institutional commitments." /><Section><Container className="max-w-4xl space-y-4">{questions.map(([q,a]) => <details key={q} className="group rounded-2xl border border-gray-200 bg-white p-6"><summary className="cursor-pointer list-none font-bold text-primary-900">{q}</summary><p className="mt-4 leading-7 text-gray-600">{a}</p></details>)}</Container></Section></>;
}
