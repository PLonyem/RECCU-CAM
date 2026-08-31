import { jsPDF } from "jspdf";

export interface LoanEstimatePdfInput {
  logoDataUrl: string;
  reference: string;
  referenceLabel: string;
  date: string;
  dateLabel: string;
  preparedFor: string;
  preparedForLabel: string;
  title: string;
  rows: Array<{ label: string; value: string }>;
  nextStepHeading: string;
  nextStepLead: string;
  nextStepBody: string;
  disclaimers: string[];
}

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 18;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function drawBuildingMark(doc: jsPDF) {
  doc.setFillColor(24, 91, 125);
  doc.roundedRect(MARGIN, 14, 16, 16, 2, 2, "F");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.65);
  doc.line(22, 26, 22, 21);
  doc.line(26, 26, 26, 18.5);
  doc.line(30, 26, 30, 21);
  doc.line(20.5, 26, 31.5, 26);
  doc.line(24, 21, 28, 21);
  doc.line(24, 18.5, 28, 18.5);
}

export function buildLoanEstimatePdf(input: LoanEstimatePdfInput) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  doc.setProperties({
    title: `${input.title} - ${input.reference}`,
    subject: "CamCCUL indicative loan estimate",
    author: "Cameroon Cooperative Credit Union League",
    creator: "CamCCUL Smart Loan Calculator",
  });

  // Subtle watermark: the near-white tint approximates 6% opacity while
  // remaining compatible with PDF viewers that ignore transparency states.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(58);
  doc.setTextColor(239, 243, 247);
  doc.text("CamCCUL", PAGE_WIDTH / 2, 158, { align: "center", angle: 38 });

  try {
    doc.addImage(input.logoDataUrl, "JPEG", MARGIN, 14, 18, 15.3, undefined, "FAST");
  } catch {
    drawBuildingMark(doc);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(20, 50, 70);
  doc.text("CAMCCUL - Cameroon Cooperative Credit Union League", PAGE_WIDTH / 2, 20, {
    align: "center",
  });
  doc.setFontSize(20);
  doc.setCharSpace(1.6);
  doc.setTextColor(17, 24, 39);
  doc.text(input.title.toUpperCase(), PAGE_WIDTH / 2, 29, { align: "center" });
  doc.setCharSpace(0);
  doc.setDrawColor(190, 197, 205);
  doc.setLineWidth(0.35);
  doc.line(MARGIN, 36, PAGE_WIDTH - MARGIN, 36);

  doc.setFontSize(8.8);
  doc.setTextColor(107, 114, 128);
  doc.setFont("helvetica", "normal");
  doc.text(`${input.referenceLabel}:`, MARGIN, 46);
  doc.text(`${input.dateLabel}:`, PAGE_WIDTH - MARGIN - 48, 46);
  doc.text(`${input.preparedForLabel}:`, MARGIN, 53);
  doc.setTextColor(31, 41, 55);
  doc.setFont("courier", "bold");
  doc.text(input.reference, MARGIN + 32, 46);
  doc.setFont("helvetica", "bold");
  doc.text(input.date, PAGE_WIDTH - MARGIN, 46, { align: "right" });
  doc.text(input.preparedFor, MARGIN + 24, 53);

  const tableTop = 63;
  const rowHeight = 12;
  input.rows.forEach((row, index) => {
    const y = tableTop + index * rowHeight;
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(MARGIN, y, CONTENT_WIDTH, rowHeight, "F");
    }
    doc.setFontSize(9.2);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(row.label, MARGIN + 4, y + 7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text(row.value.replace(/[\u00a0\u202f]/g, " "), PAGE_WIDTH - MARGIN - 4, y + 7.5, {
      align: "right",
    });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, y + rowHeight, PAGE_WIDTH - MARGIN, y + rowHeight);
  });

  const nextStepY = tableTop + input.rows.length * rowHeight + 12;
  doc.setFillColor(239, 247, 250);
  doc.rect(MARGIN, nextStepY, CONTENT_WIDTH, 31, "F");
  doc.setDrawColor(24, 91, 125);
  doc.setLineWidth(1.2);
  doc.line(MARGIN, nextStepY, MARGIN, nextStepY + 31);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 50, 70);
  doc.text(input.nextStepHeading, MARGIN + 6, nextStepY + 8);
  doc.setFontSize(9.5);
  doc.setTextColor(31, 41, 55);
  doc.text(input.nextStepLead, MARGIN + 6, nextStepY + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(75, 85, 99);
  const nextStepLines = doc.splitTextToSize(input.nextStepBody, CONTENT_WIDTH - 12);
  doc.text(nextStepLines, MARGIN + 6, nextStepY + 23);

  const disclaimerY = nextStepY + 43;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.7);
  doc.setTextColor(107, 114, 128);
  input.disclaimers.forEach((text, index) => {
    doc.text(`- ${text}`, MARGIN, disclaimerY + index * 5);
  });

  const footerY = PAGE_HEIGHT - 20;
  doc.setDrawColor(190, 197, 205);
  doc.setLineWidth(0.35);
  doc.line(MARGIN, footerY - 6, PAGE_WIDTH - MARGIN, footerY - 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(20, 50, 70);
  doc.text("Cameroon Cooperative Credit Union League", PAGE_WIDTH / 2, footerY, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(107, 114, 128);
  doc.text(
    "Commercial Avenue, Bamenda | +237 233 36 11 82 | info@camccul.cm",
    PAGE_WIDTH / 2,
    footerY + 5,
    { align: "center" }
  );

  if (doc.getNumberOfPages() !== 1) {
    throw new Error("Loan estimate PDF must contain exactly one page.");
  }

  return doc;
}

export function downloadLoanEstimatePdf(input: LoanEstimatePdfInput) {
  const doc = buildLoanEstimatePdf(input);
  doc.save(`CamCCUL-Loan-Estimate-${input.reference}.pdf`);
}
