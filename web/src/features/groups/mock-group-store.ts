import { useSyncExternalStore } from "react";

export type GroupStatus = "matched" | "pending";
export type ParticipantStatus = "joined" | "pending";
export type ChatTone = "muted" | "self" | "warm";

export type MockParticipant = {
  initials: string;
  name: string;
  email: string;
  status: ParticipantStatus;
  family: string;
  color: string;
};

export type MockChatMessage = {
  author: string;
  time: string;
  text: string;
  tone: ChatTone;
};

export type MockJoinRequest = {
  id: string;
  name: string;
  email: string;
  requestedAt: string;
};

export type MockGroup = {
  id: string;
  code: string;
  name: string;
  eventDate: string;
  budgetLimit: number;
  description: string;
  location: string;
  adminId: string;
  isLocked: boolean;
  createdAt: string;
  inviteCode: string;
  inviteExpiresAt: string;
  status: GroupStatus;
  families: string[];
  participants: MockParticipant[];
  joinRequests: MockJoinRequest[];
  chatMessages: MockChatMessage[];
  matchName: string;
};

const GROUPS_KEY = "secret-santa.mock-groups";
const GROUPS_UPDATED_EVENT = "secret-santa.mock-groups-updated";
let cachedGroups: MockGroup[] | null = null;

export const defaultGroups: MockGroup[] = [];

export function slugifyGroupName(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || `group-${Date.now()}`;
}

export function getMockGroups() {
  if (typeof window === "undefined") return defaultGroups;
  if (cachedGroups) return cachedGroups;

  const storedGroups = window.localStorage.getItem(GROUPS_KEY);
  if (!storedGroups) {
    cachedGroups = defaultGroups;
    window.localStorage.setItem(GROUPS_KEY, JSON.stringify(defaultGroups));
    return defaultGroups;
  }

  try {
    const groups = JSON.parse(storedGroups) as Partial<MockGroup>[];
    const normalisedGroups = groups.map(normaliseMockGroup);
    cachedGroups = normalisedGroups;
    window.localStorage.setItem(GROUPS_KEY, JSON.stringify(normalisedGroups));
    return normalisedGroups;
  } catch {
    cachedGroups = defaultGroups;
    window.localStorage.setItem(GROUPS_KEY, JSON.stringify(defaultGroups));
    return defaultGroups;
  }
}

function normaliseMockGroup(group: Partial<MockGroup>): MockGroup {
  return {
    id: group.id ?? slugifyGroupName(group.name ?? "Untitled Group"),
    code: group.code ?? "#2026-000",
    name: group.name ?? "Untitled Group",
    eventDate: group.eventDate ?? "",
    budgetLimit: group.budgetLimit ?? 0,
    description: group.description ?? "",
    location: group.location ?? "Location not set",
    adminId: group.adminId ?? "user-1",
    isLocked: group.isLocked ?? false,
    createdAt: group.createdAt ?? new Date().toISOString(),
    inviteCode: group.inviteCode ?? Math.random().toString(36).slice(2, 8).toUpperCase(),
    inviteExpiresAt: group.inviteExpiresAt ?? group.eventDate ?? "",
    status: group.status ?? "pending",
    families: group.families ?? ["None"],
    participants: group.participants ?? [],
    joinRequests: group.joinRequests ?? [],
    chatMessages: group.chatMessages ?? [],
    matchName: group.matchName ?? "",
  };
}

export function saveMockGroups(groups: MockGroup[]) {
  cachedGroups = groups;
  window.localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  window.dispatchEvent(new Event(GROUPS_UPDATED_EVENT));
}

export function createMockGroup(data: {
  name: string;
  budgetLimit: number;
  eventDate: string;
  description: string;
}) {
  const groups = getMockGroups();
  const id = slugifyGroupName(data.name);
  const group: MockGroup = {
    id,
    code: `#${new Date().getFullYear()}-${String(groups.length + 1).padStart(3, "0")}`,
    name: data.name,
    eventDate: data.eventDate,
    budgetLimit: data.budgetLimit,
    description: data.description,
    location: "Location not set",
    adminId: "user-1",
    isLocked: false,
    createdAt: new Date().toISOString(),
    inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
    inviteExpiresAt: data.eventDate,
    status: "pending",
    families: ["None"],
    participants: [],
    joinRequests: [],
    chatMessages: [],
    matchName: "",
  };

  saveMockGroups([group, ...groups.filter((existingGroup) => existingGroup.id !== id)]);
  return group;
}

export function updateMockGroup(group: MockGroup) {
  const groups = getMockGroups();
  saveMockGroups(groups.map((storedGroup) => (storedGroup.id === group.id ? group : storedGroup)));
}

export function deleteMockGroup(groupId: string) {
  saveMockGroups(getMockGroups().filter((group) => group.id !== groupId));
}

export function subscribeToMockGroups(onStoreChange: () => void) {
  function handleStorageChange() {
    cachedGroups = null;
    onStoreChange();
  }

  window.addEventListener(GROUPS_UPDATED_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(GROUPS_UPDATED_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}

export function useMockGroups() {
  return useSyncExternalStore(
    subscribeToMockGroups,
    getMockGroups,
    () => defaultGroups,
  );
}
