import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { isAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import { regions } from "@/data/admin-options";
import { isSafeCsvFile } from "@/lib/security/file-upload";

const MAX_ROWS = 2000;
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const csvRowSchema = z.object({
  code: z.string().min(1, "code is required").max(40),
  name: z.string().min(1, "name is required").max(200),
  region: z
    .string()
    .refine((value) => regions.includes(value), "invalid region"),
  city: z.string().max(120).optional(),
  address: z.string().max(300).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().email().max(254).optional(),
});

function cell(value: unknown): string | undefined {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || undefined;
}

export async function POST(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !isAdminRole(sessionClaims?.metadata?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No CSV file provided (expected a 'file' field)" },
      { status: 400 }
    );
  }
  if (!isSafeCsvFile(file) || file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Upload a non-empty CSV file no larger than 2MB." },
      { status: 400 },
    );
  }

  const text = await file.text();
  if (text.includes("\0")) {
    return NextResponse.json({ error: "The CSV contains invalid binary data." }, { status: 400 });
  }
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.data.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `Too many rows — max ${MAX_ROWS} per import.` },
      { status: 400 }
    );
  }

  let created = 0;
  let updated = 0;
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < parsed.data.length; i++) {
    const raw = parsed.data[i];
    const rowNumber = i + 2; // +1 for 1-indexing, +1 for the header row

    const result = csvRowSchema.safeParse({
      code: cell(raw.code),
      name: cell(raw.name),
      region: cell(raw.region),
      city: cell(raw.city),
      address: cell(raw.address),
      phone: cell(raw.phone),
      email: cell(raw.email),
    });

    if (!result.success) {
      errors.push({
        row: rowNumber,
        message: result.error.issues.map((issue) => issue.message).join(", "),
      });
      continue;
    }

    const data = result.data;

    const existing = await prisma.affiliate.findUnique({
      where: { code: data.code },
      select: { id: true },
    });

    await prisma.affiliate.upsert({
      where: { code: data.code },
      create: {
        code: data.code,
        name: data.name,
        region: data.region,
        city: data.city ?? null,
        address: data.address ?? null,
        phone: data.phone ?? null,
        email: data.email ?? null,
        isActive: true,
      },
      update: {
        name: data.name,
        region: data.region,
        city: data.city ?? null,
        address: data.address ?? null,
        phone: data.phone ?? null,
        email: data.email ?? null,
      },
    });

    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  return NextResponse.json({ created, updated, errors });
}
