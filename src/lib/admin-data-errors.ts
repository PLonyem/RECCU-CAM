export type AdminDataErrorCategory = "connection" | "schema" | "unknown";

export interface AdminDataErrorDetails {
  category: AdminDataErrorCategory;
  code: string | null;
  status: 500 | 503;
}

function safePrismaCode(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" && /^P\d{4}$/.test(code) ? code : null;
}

export function classifyAdminDataError(error: unknown): AdminDataErrorDetails {
  const code = safePrismaCode(error);

  if (error instanceof Error && error.name === "DatabaseConfigurationError") {
    return { category: "connection", code: null, status: 503 };
  }

  if (code && ["P1000", "P1001", "P1002", "P1008", "P1017"].includes(code)) {
    return { category: "connection", code, status: 503 };
  }

  if (code && ["P2021", "P2022", "P2023"].includes(code)) {
    return { category: "schema", code, status: 503 };
  }

  return { category: "unknown", code, status: 500 };
}
