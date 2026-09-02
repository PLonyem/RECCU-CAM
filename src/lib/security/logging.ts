import "server-only";

export function reportServerError(context: string, error: unknown) {
  const safeDetails =
    error && typeof error === "object"
      ? {
          name: "name" in error ? String(error.name) : "Error",
          code: "code" in error ? String(error.code) : undefined,
        }
      : { name: "Error" };

  console.error(`[server] ${context}`, safeDetails);
}

export function reportServerEvent(context: string) {
  console.info(`[server] ${context}`);
}
