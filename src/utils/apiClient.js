import { readAuthToken } from "./authToken";

const API_BASE = typeof window !== "undefined" && window.finverde?.apiBase
  ? window.finverde.apiBase
  : "/api";

export async function apiRequest(path, options = {}) {
  const token = readAuthToken();
  const { headers: extraHeaders, ...rest } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(extraHeaders || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}
