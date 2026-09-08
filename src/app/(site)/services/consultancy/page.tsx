import type { Metadata } from "next";
import { ServiceDetailOverview } from "@/components/services/ServiceDetailOverview";
import { serviceAreas } from "@/data/services";
import { createLocalizedPageMetadata } from "@/lib/seo-server";

const service = serviceAreas.consultancy;

export async function generateMetadata(): Promise<Metadata> { return createLocalizedPageMetadata({
  title: service.title,
  description: service.description,
  path: service.href,
}); }

export default function ConsultancyPage() {
  return <ServiceDetailOverview service={service} />;
}
