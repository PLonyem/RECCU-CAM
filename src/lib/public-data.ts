type PublicDataReporter = (message: string) => void;

function errorCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return null;
}

/**
 * Public content should remain available when an optional CMS/database read is
 * temporarily unavailable. Detailed database errors stay out of rendered
 * output and logs, where they could disclose connection information.
 */
export async function readPublicData<T>(
  label: string,
  query: () => PromiseLike<T>,
  fallback: T,
  report: PublicDataReporter = console.error,
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    const code = errorCode(error);
    report(`[public-data] ${label} unavailable${code ? ` (${code})` : ""}; using fallback.`);
    return fallback;
  }
}
