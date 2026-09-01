import type { Metadata } from "next";
import { MapExplorerClient } from "@/components/network/MapExplorerClient";
import { PageIntro } from "@/components/layout/PageIntro";
import { VerificationNote } from "@/components/layout/VerificationNote";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { networkAffiliates } from "@/data/affiliates";

export const metadata: Metadata = { title: "Network map", description: "Explore an illustrative, source-labelled map of published RECCU-CAM affiliate locations." };
export default function NetworkMapPage() { return <><PageIntro eyebrow="Network map" title="See connection in place." description="An intentionally lightweight map experience focused on published towns, source context, and fast access to affiliate profiles." /><Section><Container><VerificationNote>Map points are illustrative town-level positions, not exact branches. Confirm a visiting address through an institution’s verified channel before travelling.</VerificationNote><div className="mt-8"><MapExplorerClient affiliates={networkAffiliates} /></div></Container></Section></>; }
