import type { Metadata } from "next";
import { CreditUnionProfileTemplateClient } from "./CreditUnionProfileTemplateClient";

export const metadata: Metadata = {
  title: "Credit Union Profile Form — CamCCUL",
  description:
    "Printable form for CamCCUL-affiliated credit unions to submit their profile information.",
};

export default function CreditUnionProfileTemplatePage() {
  return <CreditUnionProfileTemplateClient />;
}
