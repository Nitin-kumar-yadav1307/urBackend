import { loadConfig } from "./config.js";
import { APIError } from "./errors.js";

export interface FetchOptions
  extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const config = loadConfig();

  const headers = new Headers(
    options.headers,
  );

 if (
    options.body &&
    !headers.has("Content-Type")
) {
    headers.set(
        "Content-Type",
        "application/json",
    );
}
  const token =
    options.token ?? config.pat;

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response = await fetch(
    `${config.apiBase}${endpoint}`,
    {
      ...options,
      headers,
    },
  );

  if (!response.ok) {
    let message = response.statusText;

    try {
      const body = await response.json();

      message =
        body.message ??
        body.error ??
        message;
    } catch {}

    throw new APIError(
      response.status,
      message,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}