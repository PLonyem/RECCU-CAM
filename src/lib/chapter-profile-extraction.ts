import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export interface ExtractedChapterFields {
  yearEstablished?: number;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  history?: string;
  memberCreditUnionCount?: number;
  totalMembers?: number;
  branchCount?: number;
  presidentName?: string;
  supervisorName?: string;
  boardMemberCount?: number;
  staffCount?: number;
}

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const DOC_MIME = "application/msword";

// Images (JPG/PNG) have no extraction path — OCR isn't wired up in this
// app, and faking a result would violate the no-fabrication rule. Staff
// simply get an empty manual entry form for those uploads, which is an
// explicitly supported outcome, not an error.
export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string
): Promise<string | null> {
  try {
    if (mimeType === PDF_MIME) {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      return result.text || null;
    }
    if (mimeType === DOCX_MIME || mimeType === DOC_MIME) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || null;
    }
    return null;
  } catch (error) {
    console.error("Chapter profile text extraction failed:", error);
    return null;
  }
}

function matchString(text: string, pattern: RegExp): string | undefined {
  const raw = text.match(pattern)?.[1]?.trim();
  return raw || undefined;
}

function matchNumber(text: string, pattern: RegExp): number | undefined {
  const raw = matchString(text, pattern);
  if (!raw) return undefined;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

// Best-effort only: assumes the uploaded document keeps each field's label
// and answer on the same line, as in a digitally filled copy of the
// Chapter Profile Form template. Handwritten or rescanned copies will
// often match nothing, in which case staff fill the form manually — an
// expected, documented fallback rather than a bug.
export function parseChapterFieldsFromText(text: string): ExtractedChapterFields {
  return {
    yearEstablished: matchNumber(text, /Year Chapter Was Established:?\s*(\d{4})/i),
    address: matchString(text, /Physical Address:?\s*(.+)/i),
    city: matchString(text, /City\/?Town:?\s*(.+)/i),
    phone: matchString(text, /Primary Phone Number:?\s*(.+)/i),
    email: matchString(text, /Email Address:?\s*(.+)/i),
    memberCreditUnionCount: matchNumber(
      text,
      /Number of Member Credit Unions[^:]*:?\s*(\d+)/i
    ),
    totalMembers: matchNumber(text, /Total Members[^:]*:?\s*(\d+)/i),
    branchCount: matchNumber(text, /Number of Branches[^:]*:?\s*(\d+)/i),
    presidentName: matchString(text, /Chapter President Name:?\s*(.+)/i),
    supervisorName: matchString(text, /Chapter Supervisor Name:?\s*(.+)/i),
    boardMemberCount: matchNumber(text, /Number of Board Members:?\s*(\d+)/i),
    staffCount: matchNumber(text, /Number of Chapter Staff:?\s*(\d+)/i),
    history: matchString(
      text,
      /Brief History of the Chapter[^:]*:?\s*([\s\S]*?)(?=Number of Member Credit Unions|SECTION 4|$)/i
    ),
  };
}
