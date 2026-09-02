import type { Metadata } from "next";
import { ServiceDetailOverview } from "@/components/services/ServiceDetailOverview";
import { serviceAreas } from "@/data/services";
import { createPageMetadata } from "@/lib/seo";

const service = serviceAreas.supervisionCompliance;

export const metadata: Metadata = createPageMetadata({
  title: service.title,
  description: service.description,
  path: service.href,
});

export default function SupervisionCompliancePage() {
  return <ServiceDetailOverview service={service} />;
}
