
import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = { title: "VTIME calendar" };
export default function CalendarPage() { return <><PageIntro eyebrow="VTIME calendar" title="Dates appear only when they are ready to rely on." description="The calendar is intentionally empty until RECCU-CAM confirms each programme’s date, delivery mode, venue, facilitator, and registration owner." /><Section><Container><div className="rounded-3xl border border-dashed border-primary-200 bg-primary-50 p-12 text-center"><CalendarClock className="mx-auto h-10 w-10 text-primary-600" /><h2 className="mt-5 font-display text-2xl font-bold text-primary-900">No verified training dates published</h2><p className="mx-auto mt-3 max-w-xl leading-7 text-gray-600">This state avoids carrying over obsolete dates or inventing a RECCU-CAM schedule.</p></div></Container></Section></>; }
