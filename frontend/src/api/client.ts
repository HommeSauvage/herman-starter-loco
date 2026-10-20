import { clearToken, getToken } from "../auth/token";
import type { ApiError } from "../bindings/ApiError";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly details: unknown;

  constructor(status: number, body: ApiError | null) {
    super(body?.message ?? `Request failed with status ${status}`);
    this.name = "ApiClientError";
    this.status = status;
    this.code = body?.code ?? null;
    this.details = body?.details ?? null;
  }
}

async function parseErrorBody(res: Response): Promise<ApiError | null> {
  try {
    const data: unknown = await res.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "code" in data &&
      "message" in data
    ) {
      return data as ApiError;
    }
    return null;
  } catch {
    return null;
  }
}

export async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    method,
    headers,
    credentials: "same-origin",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.ok) {
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  }

  const errorBody = await parseErrorBody(res);

  // The session is gone or invalid. Clearing the token is enough: the auth
  // provider re-renders and RequireAuth sends the user to /login.
  if (res.status === 401) {
    clearToken();
  }

  throw new ApiClientError(res.status, errorBody);
}

export function get<T>(path: string): Promise<T> {
  return request<T>("GET", path);
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, body);
}

export function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>("PUT", path, body);
}

export function del(path: string): Promise<void> {
  return request<void>("DELETE", path);
}
