export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export function getApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export function getWebSocketUrl(path: string) {
  const wsBaseUrl =
    process.env.NEXT_PUBLIC_WS_URL ??
    API_BASE_URL.replace(/^https:/, "wss:").replace(/^http:/, "ws:");

  return `${wsBaseUrl}${path}`;
}
