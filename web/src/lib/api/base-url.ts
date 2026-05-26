export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function joinBaseUrl(baseUrl: string, path: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBaseUrl}${normalizedPath}`;
}

export function getApiUrl(path: string) {
  return joinBaseUrl(API_BASE_URL, path);
}

export function getWebSocketUrl(path: string) {
  const wsBaseUrl = API_BASE_URL.replace(/^https:/, "wss:").replace(/^http:/, "ws:");

  return joinBaseUrl(wsBaseUrl, path);
}
