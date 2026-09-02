import type { Metadata } from "next";
import { ServiceDetailOverview } from "@/components/services/ServiceDetailOverview";
import { serviceAreas } from "@/data/services";
import { createPageMetadata } from "@/lib/seo";

const service = serviceAreas.consultancy;

export const metadata: Metadata = createPageMetadata({
  title: service.title,
  description: service.description,
  path: service.href,
});

export default function ConsultancyPage() {
  return <ServiceDetailOverview service={service} />;
}
