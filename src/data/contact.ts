export const contactPurposeOptions = [
  { value: "general-inquiry", label: "General Inquiry", department: "Administration / Front Office" },
  { value: "affiliate-support", label: "Affiliate Support", department: "Network / Affiliate Relations" },
  { value: "becoming-an-affiliate", label: "Becoming an Affiliate", department: "Network Development" },
  { value: "affiliate-banking", label: "Affiliate Banking", department: "Affiliate Banking / Finance" },
  { value: "training-vtime", label: "Training / VTIME", department: "Training Department" },
  { value: "compliance-regulatory", label: "Compliance / Regulatory Inquiry", department: "Compliance / Internal Control" },
  { value: "partnership-collaboration", label: "Partnership / Collaboration", department: "Management / Partnerships" },
  { value: "media-press", label: "Media / Press Inquiry", department: "Communications" },
  { value: "technical-website-support", label: "Technical / Website Support", department: "IT / Digital" },
  { value: "careers-professional-opportunities", label: "Careers / Professional Opportunities", department: "Administration / HR" },
  { value: "complaint-feedback", label: "Complaint / Feedback", department: "Management / Customer Relations" },
  { value: "other", label: "Other", department: "Administration / Front Office" },
] as const;

export type ContactPurpose = (typeof contactPurposeOptions)[number]["value"];

export function getContactPurpose(value: ContactPurpose) {
  return contactPurposeOptions.find((option) => option.value === value)!;
}
