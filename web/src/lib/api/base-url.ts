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

export function getGroupChatWebSocketUrl(groupId: string) {
  return getWebSocketUrl(`/groups/${encodeURIComponent(groupId)}/chat/ws`);
}

export function createGroupChatWebSocket(groupId: string) {
  return new WebSocket(getGroupChatWebSocketUrl(groupId));
}
