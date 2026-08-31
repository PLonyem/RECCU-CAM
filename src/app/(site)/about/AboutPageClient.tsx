"use client";

import { Hero } from "./sections/Hero";
import { StatisticsStrip } from "./sections/StatisticsStrip";
import { Vision } from "./sections/Vision";
import { Legacy } from "./sections/Legacy";
import { Purpose } from "./sections/Purpose";
import { CoreValues } from "./sections/CoreValues";
import { OurLeadership } from "./sections/OurLeadership";
import { CallToAction } from "./sections/CallToAction";

interface AboutPageClientProps {
  affiliateCount: number;
}

export function AboutPageClient({ affiliateCount }: AboutPageClientProps) {
  return (
    <>
      <Hero />
      <StatisticsStrip affiliateCount={affiliateCount} />
      <Vision />
      <Legacy />
      <Purpose />
      <CoreValues />
      <OurLeadership />
      <CallToAction />
    </>
  );
}
