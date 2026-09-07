export interface AdminDataSuccess<T> {
  ok: true;
  data: T;
  status: number;
}

export interface AdminDataFailure {
  ok: false;
  message: string;
  status: number | null;
  fieldErrors?: Record<string, string[]>;
}

export type AdminDataResult<T> = AdminDataSuccess<T> | AdminDataFailure;
type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function messageForStatus(status: number | null) {
  if (status === 401) return "Your session has expired. Sign in again and retry.";
  if (status === 403) return "You do not have permission to load this data.";
  return "Unable to load this section. Please retry.";
}

export async function requestAdminData<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
  fetcher: Fetcher = fetch,
): Promise<AdminDataResult<T>> {
  try {
    const response = await fetcher(input, init);
    if (!response.ok) {
      if (response.status === 400) {
        const body = await response.json().catch(() => null) as {
          error?: unknown;
          errors?: unknown;
          details?: { fieldErrors?: unknown };
        } | null;
        return {
          ok: false,
          message: typeof body?.error === "string" ? body.error : "Review the highlighted fields.",
          status: response.status,
          fieldErrors: (body?.errors ?? body?.details?.fieldErrors) as Record<string, string[]> | undefined,
        };
      }
      return { ok: false, message: messageForStatus(response.status), status: response.status };
    }

    return { ok: true, data: await response.json() as T, status: response.status };
  } catch {
    return { ok: false, message: messageForStatus(null), status: null };
  }
}
