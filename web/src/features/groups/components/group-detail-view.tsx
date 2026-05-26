"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Expand,
  Gift,
  MapPin,
  Minimize2,
  MoreVertical,
  Pencil,
  RefreshCw,
  Send,
  ShieldCheck,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import AddFamilyModal, { FamilyModalParticipant } from "./add-family-modal";
import { useAuth } from "@/src/features/auth/context/auth-provider";
import { getAuthOptions } from "@/src/lib/api/auth-options";
import { getApiUrl, getWebSocketUrl } from "@/src/lib/api/base-url";
import {
  deleteGroupsGroupId,
  Family,
  getGroupsGroupId,
  getGroupsGroupIdFamilies,
  getGroupsGroupIdMatches,
  Group,
  Match,
  postGroupsGroupIdFamilies,
  postGroupsGroupIdMatches,
  putGroupsGroupId,
  putGroupsGroupIdMembersMemberId,
} from "@/src/lib/api/generated/client";

type ApiGroup = Group & {
  budgetLimit?: number;
  description?: string;
  location?: string;
};

type ApiMember = {
  id: string;
  userId: string;
  groupId: string;
  familyId?: string | null;
  joinedAt?: string;
  user?: {
    id: string;
    displayName?: string | null;
    email: string;
    icon?: string | null;
    description?: string | null;
  };
};

type ApiJoinRequest = {
  id: string;
  user: {
    displayName?: string;
    email: string;
  };
  requestedAt: string;
};

type ApiMessage = {
  id?: string;
  senderUserId?: string;
  content?: string;
  createdAt?: string;
  author?: string;
  time?: string;
  text?: string;
  tone?: "muted" | "self" | "warm";
  senderUser?: {
    displayName?: string | null;
    email: string;
  };
};

type GroupSocketEvent =
  | { type: "chatMessage"; message: ApiMessage }
  | { type: "matchesUpdated" };

type ActionStatus = "idle" | "loading" | "success" | "error";

const MATCH_REVEAL_STORAGE_KEY = "secret-santa.revealed-matches";
const CHAT_BOTTOM_THRESHOLD_PX = 80;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getMatchSignature(matches: Match[]) {
  return matches
    .map((match) => `${match.givingUserId}:${match.receivingUserId}`)
    .sort()
    .join("|");
}

function readRevealedMatchSignatures() {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(window.localStorage.getItem(MATCH_REVEAL_STORAGE_KEY) ?? "{}") as Record<
      string,
      string
    >;
  } catch {
    return {};
  }
}

function storeRevealedMatchSignature(groupId: string, signature: string) {
  if (typeof window === "undefined" || !signature) return;

  const revealedMatches = readRevealedMatchSignatures();
  window.localStorage.setItem(
    MATCH_REVEAL_STORAGE_KEY,
    JSON.stringify({ ...revealedMatches, [groupId]: signature }),
  );
}

function clearRevealedMatchSignature(groupId: string) {
  if (typeof window === "undefined") return;

  const revealedMatches = readRevealedMatchSignatures();
  delete revealedMatches[groupId];
  window.localStorage.setItem(
    MATCH_REVEAL_STORAGE_KEY,
    JSON.stringify(revealedMatches),
  );
}

function getChatMessageKey(message: ApiMessage) {
  return (
    message.id ??
    `${message.senderUserId ?? message.author}-${message.createdAt ?? message.time}-${
      message.content ?? message.text
    }`
  );
}

function mergeChatMessages(currentMessages: ApiMessage[], incomingMessages: ApiMessage[]) {
  const messagesByKey = new Map<string, ApiMessage>();

  [...currentMessages, ...incomingMessages].forEach((message) => {
    messagesByKey.set(getChatMessageKey(message), message);
  });

  return Array.from(messagesByKey.values()).sort((firstMessage, secondMessage) => {
    if (!firstMessage.createdAt || !secondMessage.createdAt) return 0;
    return (
      new Date(firstMessage.createdAt).getTime() -
      new Date(secondMessage.createdAt).getTime()
    );
  });
}

function isChatScrolledNearBottom(element: HTMLDivElement) {
  return (
    element.scrollHeight - element.scrollTop - element.clientHeight <=
    CHAT_BOTTOM_THRESHOLD_PX
  );
}

function isGroupSocketEvent(value: unknown): value is GroupSocketEvent {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return false;
  }

  const type = (value as { type?: unknown }).type;
  return type === "chatMessage" || type === "matchesUpdated";
}

async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const authOptions = await getAuthOptions();
  const requestInit = {
    ...init,
    cache: "no-store" as RequestCache,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...authOptions.headers,
      ...init.headers,
    },
  };
  let response = await fetch(getApiUrl(path), requestInit);

  if (response.status === 401) {
    const refreshedAuthOptions = await getAuthOptions({ forceRefresh: true });
    response = await fetch(getApiUrl(path), {
      ...requestInit,
      headers: {
        ...requestInit.headers,
        ...refreshedAuthOptions.headers,
      },
    });
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(payload?.error ?? payload?.message ?? "Request failed");
  }
  return payload as T;
}

export default function GroupDetailView() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const inviteFeedbackTimeoutRef = useRef<number | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const shouldStickToChatBottomRef = useRef(true);
  const [group, setGroup] = useState<ApiGroup | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [joinRequests, setJoinRequests] = useState<ApiJoinRequest[]>([]);
  const [chatMessages, setChatMessages] = useState<ApiMessage[]>([]);
  const [hasUnreadRecentMessages, setHasUnreadRecentMessages] = useState(false);
  const [isAddFamilyOpen, setIsAddFamilyOpen] = useState(false);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [editGroupForm, setEditGroupForm] = useState({
    name: "",
    budgetLimit: "",
    eventDate: "",
    location: "",
    description: "",
  });
  const [isMatchRevealed, setIsMatchRevealed] = useState(false);
  const [isMatchRevealing, setIsMatchRevealing] = useState(false);
  const [message, setMessage] = useState("");
  const [inviteCopyStatus, setInviteCopyStatus] = useState<
    "idle" | "copied" | "failed"
  >("idle");
  const [actionMessage, setActionMessage] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<ActionStatus>("idle");
  const [rerollStatus, setRerollStatus] = useState<ActionStatus>("idle");
  const [saveStatus, setSaveStatus] = useState<ActionStatus>("idle");
  const [familyStatus, setFamilyStatus] = useState<ActionStatus>("idle");
  const [activeRequestId, setActiveRequestId] = useState("");
  const [activeRequestAction, setActiveRequestAction] = useState<
    "accept" | "decline" | ""
  >("");
  const [socketStatus, setSocketStatus] = useState<"connecting" | "open" | "closed">(
    "connecting",
  );
  const activeGroupId = group?.id;

  function showActionFeedback(message: string, status: "success" | "error") {
    setActionMessage(message);
    window.setTimeout(() => {
      setActionMessage("");
      if (status === "success") {
        setDeleteStatus("idle");
        setRerollStatus("idle");
        setSaveStatus("idle");
        setFamilyStatus("idle");
      }
    }, 2400);
  }

  function scrollChatToBottom() {
    const chatScrollElement = chatScrollRef.current;
    if (!chatScrollElement) return;

    chatScrollElement.scrollTo({
      top: chatScrollElement.scrollHeight,
      behavior: "smooth",
    });
    shouldStickToChatBottomRef.current = true;
    setHasUnreadRecentMessages(false);
  }

  function handleChatScroll() {
    const chatScrollElement = chatScrollRef.current;
    if (!chatScrollElement) return;

    const isNearBottom = isChatScrolledNearBottom(chatScrollElement);
    shouldStickToChatBottomRef.current = isNearBottom;
    if (isNearBottom) setHasUnreadRecentMessages(false);
  }

  const loadChatMessages = useCallback(async () => {
    const response = await apiFetch<ApiMessage[]>(
      `/groups/${params.groupId}/chat/messages`,
    ).catch(() => []);

    return Array.isArray(response) ? response : [];
  }, [params.groupId]);

  const loadMatches = useCallback(async () => {
    const response = await getGroupsGroupIdMatches(
      params.groupId,
      await getAuthOptions(),
    ).catch(() => []);

    return Array.isArray(response) ? response : [];
  }, [params.groupId]);

  const loadGroupData = useCallback(async () => {
    const options = await getAuthOptions();
    const [groupResponse, memberResponse, familyResponse, matchResponse, messageResponse] =
      await Promise.all([
        getGroupsGroupId(params.groupId, options),
        apiFetch<ApiMember[]>(`/groups/${params.groupId}/members`),
        getGroupsGroupIdFamilies(params.groupId, options).catch(() => []),
        loadMatches(),
        loadChatMessages(),
      ]);

    setGroup(groupResponse as ApiGroup);
    setMembers(Array.isArray(memberResponse) ? memberResponse : []);
    setFamilies(Array.isArray(familyResponse) ? familyResponse : []);
    setMatches(Array.isArray(matchResponse) ? matchResponse : []);
    setChatMessages(Array.isArray(messageResponse) ? messageResponse : []);
  }, [loadChatMessages, loadMatches, params.groupId]);

  useEffect(() => {
    let isActive = true;

    async function load() {
      await Promise.resolve();
      setIsLoadingGroup(true);
      setLoadError("");
      try {
        await loadGroupData();
        if (isActive) setLoadError("");
      } catch {
        if (isActive) {
          setGroup(null);
          setLoadError("Could not load this group.");
        }
      } finally {
        if (isActive) setIsLoadingGroup(false);
      }
    }

    load();
    return () => {
      isActive = false;
    };
  }, [loadGroupData]);

  useEffect(() => {
    if (!activeGroupId) return;

    const socket = new WebSocket(getWebSocketUrl(`/api/groups/${activeGroupId}/chat/ws`));

    socketRef.current = socket;
    socket.onopen = () => setSocketStatus("open");
    socket.onclose = () => setSocketStatus("closed");
    socket.onerror = () => setSocketStatus("closed");
    socket.onmessage = async (event) => {
      const payload = JSON.parse(event.data) as unknown;

      if (isGroupSocketEvent(payload)) {
        if (payload.type === "matchesUpdated") {
          const nextMatches = await loadMatches();
          setMatches(nextMatches);
          if (nextMatches.length) {
            setGroup((currentGroup) =>
              currentGroup ? { ...currentGroup, isLocked: true } : currentGroup,
            );
          }
          return;
        }

        setChatMessages((messages) =>
          mergeChatMessages(messages, [payload.message]),
        );
        return;
      }

      setChatMessages((messages) =>
        mergeChatMessages(messages, [payload as ApiMessage]),
      );
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [activeGroupId, loadMatches]);

  useEffect(() => {
    let isActive = true;

    async function refreshMatches() {
      await Promise.resolve();
      const nextMatches = await loadMatches();
      if (!isActive) return;

      setMatches((currentMatches) =>
        getMatchSignature(currentMatches) === getMatchSignature(nextMatches)
          ? currentMatches
          : nextMatches,
      );
      if (nextMatches.length) {
        setGroup((currentGroup) =>
          currentGroup ? { ...currentGroup, isLocked: true } : currentGroup,
        );
      }
    }

    const refreshOnFocus = () => {
      void refreshMatches();
    };
    const refreshOnVisible = () => {
      if (document.visibilityState === "visible") void refreshMatches();
    };

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnVisible);

    return () => {
      isActive = false;
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnVisible);
    };
  }, [loadMatches]);

  useEffect(() => {
    const animationFrameId = window.requestAnimationFrame(() => {
      const chatScrollElement = chatScrollRef.current;
      if (!chatScrollElement) return;

      if (shouldStickToChatBottomRef.current) {
        chatScrollElement.scrollTo({
          top: chatScrollElement.scrollHeight,
          behavior: "smooth",
        });
        setHasUnreadRecentMessages(false);
        return;
      }

      setHasUnreadRecentMessages(true);
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [chatMessages.length, isChatFullscreen]);

  useEffect(() => {
    let isActive = true;

    async function refreshChatMessages() {
      await Promise.resolve();
      const nextMessages = await loadChatMessages();
      if (isActive) {
        setChatMessages((messages) => mergeChatMessages(messages, nextMessages));
      }
    }

    const refreshOnFocus = () => {
      void refreshChatMessages();
    };
    const refreshOnVisible = () => {
      if (document.visibilityState === "visible") void refreshChatMessages();
    };

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnVisible);

    return () => {
      isActive = false;
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnVisible);
    };
  }, [loadChatMessages]);

  useEffect(() => {
    return () => {
      if (inviteFeedbackTimeoutRef.current) {
        window.clearTimeout(inviteFeedbackTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function syncRevealedMatchState() {
      await Promise.resolve();
      if (!isActive) return;

      const signature = getMatchSignature(matches);
      const storedSignature = readRevealedMatchSignatures()[params.groupId];
      setIsMatchRevealed(Boolean(signature) && storedSignature === signature);
    }

    syncRevealedMatchState();
    return () => {
      isActive = false;
    };
  }, [matches, params.groupId]);

  useEffect(() => {
    async function loadJoinRequests() {
      await Promise.resolve();
      if (!group || group.adminId !== user?.id) return;
      const requests = await apiFetch<ApiJoinRequest[]>(
        `/groups/${group.id}/join-requests`,
      ).catch(() => []);
      setJoinRequests(Array.isArray(requests) ? requests : []);
    }

    loadJoinRequests();
  }, [group, user]);

  async function copyInviteCode() {
    if (!group) return;

    try {
      await navigator.clipboard.writeText(group.inviteCode);
      setInviteCopyStatus("copied");
    } catch {
      setInviteCopyStatus("failed");
    }

    if (inviteFeedbackTimeoutRef.current) {
      window.clearTimeout(inviteFeedbackTimeoutRef.current);
    }
    inviteFeedbackTimeoutRef.current = window.setTimeout(() => {
      setInviteCopyStatus("idle");
    }, 1800);
  }

  async function assignFamily(memberId: string, familyName: string) {
    setFamilyStatus("loading");
    setActionMessage("");
    try {
      const familyId = families.find((family) => family.name === familyName)?.id ?? null;
      await putGroupsGroupIdMembersMemberId(
        params.groupId,
        memberId,
        { familyId } as Parameters<typeof putGroupsGroupIdMembersMemberId>[2],
        await getAuthOptions({ forceRefresh: true }),
      );
      await loadGroupData();
      setFamilyStatus("success");
      showActionFeedback("Family assignment saved.", "success");
    } catch {
      setFamilyStatus("error");
      showActionFeedback("Could not save family assignment.", "error");
    }
  }

  async function addFamily(familyName: string, participantEmails: string[]) {
    setFamilyStatus("loading");
    setActionMessage("");
    try {
      const family = await postGroupsGroupIdFamilies(
        params.groupId,
        { name: familyName },
        await getAuthOptions({ forceRefresh: true }),
      );
      const authOptions = await getAuthOptions({ forceRefresh: true });

      await Promise.all(
        members
          .filter((member) => participantEmails.includes(member.user?.email ?? ""))
          .map((member) =>
            putGroupsGroupIdMembersMemberId(
              params.groupId,
              member.id,
              { familyId: family.id },
              authOptions,
            ),
          ),
      );
      await loadGroupData();
      setFamilyStatus("success");
      showActionFeedback("Family added.", "success");
    } catch {
      setFamilyStatus("error");
      showActionFeedback("Could not add family.", "error");
    }
  }

  async function rerollMatches() {
    setRerollStatus("loading");
    setActionMessage("");
    try {
      const nextMatches = await postGroupsGroupIdMatches(
        params.groupId,
        await getAuthOptions({ forceRefresh: true }),
      );
      clearRevealedMatchSignature(params.groupId);
      setMatches(Array.isArray(nextMatches) ? nextMatches : []);
      setGroup((currentGroup) =>
        currentGroup ? { ...currentGroup, isLocked: true } : currentGroup,
      );
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "matchesUpdated" }));
      }
      setIsMatchRevealed(false);
      setRerollStatus("success");
      showActionFeedback("Matches rerolled.", "success");
    } catch {
      setRerollStatus("error");
      showActionFeedback("Could not reroll matches.", "error");
    }
  }

  async function deleteGroup() {
    setDeleteStatus("loading");
    setActionMessage("");
    try {
      await deleteGroupsGroupId(params.groupId, await getAuthOptions({ forceRefresh: true }));
      setDeleteStatus("success");
      router.push("/groups");
    } catch {
      setDeleteStatus("error");
      showActionFeedback("Could not delete group.", "error");
    }
  }

  function startEditingGroup() {
    if (!group) return;

    setEditGroupForm({
      name: group.name,
      budgetLimit: String(group.budgetLimit ?? ""),
      eventDate: group.eventDate ? group.eventDate.slice(0, 10) : "",
      location: group.location ?? "",
      description: group.description ?? "",
    });
    setIsEditingGroup(true);
  }

  async function saveGroupDetails() {
    if (!group) return;

    setSaveStatus("loading");
    setActionMessage("");
    try {
      const updatedGroup = await putGroupsGroupId(
        group.id,
        {
          name: editGroupForm.name.trim() || group.name,
          eventDate: editGroupForm.eventDate
            ? new Date(`${editGroupForm.eventDate}T00:00:00`).toISOString()
            : undefined,
          budgetLimit: Number(editGroupForm.budgetLimit) || undefined,
          location: editGroupForm.location.trim() || undefined,
          description: editGroupForm.description,
        } as Parameters<typeof putGroupsGroupId>[1],
        await getAuthOptions({ forceRefresh: true }),
      );
      setGroup(updatedGroup as ApiGroup);
      setIsEditingGroup(false);
      setSaveStatus("success");
      showActionFeedback("Group details saved.", "success");
    } catch {
      setSaveStatus("error");
      showActionFeedback("Could not save group details.", "error");
    }
  }

  function revealMatch() {
    setIsMatchRevealing(true);
    setIsMatchRevealed(false);
    window.setTimeout(() => {
      storeRevealedMatchSignature(params.groupId, getMatchSignature(matches));
      setIsMatchRevealing(false);
      setIsMatchRevealed(true);
    }, 900);
  }

  async function acceptJoinRequest(requestId: string) {
    setActiveRequestId(requestId);
    setActiveRequestAction("accept");
    setActionMessage("");
    try {
      await apiFetch(`/groups/${params.groupId}/join-requests/${requestId}/accept`, {
        method: "POST",
      });
      setJoinRequests((requests) =>
        requests.filter((request) => request.id !== requestId),
      );
      await loadGroupData();
      showActionFeedback("Join request accepted.", "success");
    } catch {
      showActionFeedback("Could not accept join request.", "error");
    } finally {
      setActiveRequestId("");
      setActiveRequestAction("");
    }
  }

  async function declineJoinRequest(requestId: string) {
    setActiveRequestId(requestId);
    setActiveRequestAction("decline");
    setActionMessage("");
    try {
      await apiFetch(`/groups/${params.groupId}/join-requests/${requestId}`, {
        method: "DELETE",
      });
      setJoinRequests((requests) =>
        requests.filter((request) => request.id !== requestId),
      );
      showActionFeedback("Join request declined.", "success");
    } catch {
      showActionFeedback("Could not decline join request.", "error");
    } finally {
      setActiveRequestId("");
      setActiveRequestAction("");
    }
  }

  async function sendMessage() {
    const text = message.trim();
    if (!group || !text) return;

    try {
      const createdMessage = await apiFetch<ApiMessage>(
        `/groups/${group.id}/chat/messages`,
        { method: "POST", body: JSON.stringify({ content: text }) },
      );

      setChatMessages((messages) => mergeChatMessages(messages, [createdMessage]));

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({ type: "chatMessage", message: createdMessage }),
        );
      }

      setMessage("");
    } catch {
      showActionFeedback("Could not send message.", "error");
    }
  }

  if (isLoadingGroup && !group) {
    return (
      <section className="flex h-full items-center justify-center bg-background px-4 py-6 text-center text-text sm:px-6 md:px-10">
        <h1 className="font-heading text-3xl font-extrabold text-primary">
          Loading...
        </h1>
      </section>
    );
  }

  if (!group) {
    return (
      <section className="h-full bg-background px-4 py-6 text-text sm:px-6 md:px-10 md:py-8">
        <h1 className="font-heading text-3xl font-extrabold text-primary">
          Group not found
        </h1>
        {loadError ? <p className="mt-2 text-text-muted">{loadError}</p> : null}
        <Link className="mt-4 inline-block font-bold hover:text-primary" href="/groups">
          Back to groups
        </Link>
      </section>
    );
  }

  const isAdmin = group.adminId === user?.id;
  const familyNames = ["None", ...families.map((family) => family.name)];
  const participants: FamilyModalParticipant[] = members.map((member) => {
    const name = member.user?.displayName || member.user?.email || member.userId;
    return {
      initials: getInitials(name),
      name,
      email: member.user?.email ?? member.userId,
      family: families.find((family) => family.id === member.familyId)?.name ?? "None",
      color: "bg-border text-text",
    };
  });
  const myMatch = matches.find((match) => match.givingUserId === user?.id);
  const myMatchMember = members.find(
    (member) => member.userId === myMatch?.receivingUserId,
  );
  const myMatchName =
    myMatchMember?.user?.displayName || myMatchMember?.user?.email || "No match yet";
  const chatConnectionStatus = socketStatus;
  const matchActionLabel = matches.length ? "Reroll Matches" : "Generate Matches";

  return (
    <>
      {isChatFullscreen ? (
        <button
          aria-label="Close fullscreen chat backdrop"
          className="fixed inset-0 z-30 cursor-default bg-black/35 backdrop-blur-sm"
          onClick={() => setIsChatFullscreen(false)}
        />
      ) : null}
      <section className="grid h-full overflow-hidden bg-background px-4 py-5 text-text sm:px-6 md:px-10 md:py-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-8">
        <div className="min-h-0 overflow-y-auto pb-20 pr-0 sm:pr-2 xl:pb-0">
          <div className="mb-5">
            <nav className="mb-3 flex min-w-0 items-center gap-2 text-sm font-bold text-text-muted">
              <Link className="shrink-0 hover:text-primary" href="/groups">
                Groups
              </Link>
              <span aria-hidden="true">/</span>
              <span className="min-w-0 truncate text-text">{group.name}</span>
            </nav>

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <h1 className="min-w-0 break-words font-heading text-3xl font-extrabold text-primary">
                {group.name}
              </h1>
              {isAdmin ? (
                <span className="w-fit rounded-sm border border-text-muted px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                  Admin
                </span>
              ) : null}
              <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
                <span className="w-fit rounded-xl bg-primary/20 px-4 py-2 text-sm font-extrabold uppercase tracking-widest text-primary">
                  {matches.length ? "matched" : "pending"}
                </span>
                <div className="flex -space-x-2">
                  {participants.slice(0, 3).map((participant) => (
                    <span
                      key={participant.email}
                      className="flex size-9 items-center justify-center rounded-full bg-border text-xs font-bold text-text ring-2 ring-background"
                    >
                      {participant.initials}
                    </span>
                  ))}
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-background ring-2 ring-background">
                    +{Math.max(participants.length - 3, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-neutral p-4 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex items-center gap-4 font-extrabold">
              <ShieldCheck size={26} className="text-primary" />
              {isAdmin ? "Administrative Actions" : "Group Actions"}
            </div>
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-wrap xl:ml-auto">
              <button
                className={
                  inviteCopyStatus === "copied"
                    ? "inline-flex h-11 cursor-pointer items-center justify-center gap-3 rounded border border-primary/40 bg-primary/20 px-4 font-bold text-primary"
                    : inviteCopyStatus === "failed"
                      ? "inline-flex h-11 cursor-pointer items-center justify-center gap-3 rounded border border-secondary/50 bg-tertiary px-4 font-bold text-secondary"
                      : "inline-flex h-11 cursor-pointer items-center justify-center gap-3 rounded border border-border px-4 font-bold hover:bg-surface"
                }
                onClick={copyInviteCode}
              >
                {inviteCopyStatus === "copied" ? <Check size={18} /> : <UserPlus size={18} />}
                {inviteCopyStatus === "copied"
                  ? "Copied"
                  : inviteCopyStatus === "failed"
                    ? "Copy failed"
                    : "Copy Code"}
              </button>
              {isAdmin ? (
                <>
                  <button
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-3 rounded border border-border px-4 font-bold hover:bg-surface"
                    onClick={startEditingGroup}
                  >
                    <Pencil size={18} />
                    Edit Group
                  </button>
                  <button
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-3 rounded border border-border px-4 font-bold hover:bg-surface"
                    onClick={() => setIsAddFamilyOpen(true)}
                  >
                    <Users size={18} />
                    Add Family
                  </button>
                  <button
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-3 rounded border border-border px-4 font-bold hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={rerollStatus === "loading"}
                    onClick={rerollMatches}
                  >
                    <RefreshCw
                      size={18}
                      className={rerollStatus === "loading" ? "animate-spin" : ""}
                    />
                    {rerollStatus === "loading" ? "Generating..." : matchActionLabel}
                  </button>
                  <button
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-3 rounded border border-secondary/50 px-4 font-bold text-secondary hover:bg-tertiary disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={deleteStatus === "loading"}
                    onClick={deleteGroup}
                  >
                    <Trash2 size={18} />
                    {deleteStatus === "loading" ? "Deleting..." : "Delete Group"}
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {actionMessage ? (
            <div
              className={
                actionMessage.startsWith("Could not")
                  ? "mb-6 rounded border border-secondary/40 bg-tertiary px-4 py-3 font-bold text-secondary"
                  : "mb-6 rounded border border-primary/30 bg-primary/20 px-4 py-3 font-bold text-primary"
              }
            >
              {actionMessage}
            </div>
          ) : null}

          {isEditingGroup ? (
            <section className="mb-6 rounded-lg bg-surface p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-heading text-xl font-extrabold text-text">
                  Edit Group Details
                </h2>
                <button
                  className="cursor-pointer font-bold text-text hover:text-primary"
                  onClick={() => setIsEditingGroup(false)}
                >
                  Cancel
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="text-xs font-bold uppercase tracking-widest text-text">
                    Group Name
                  </span>
                  <input
                    className="mt-2 h-11 w-full rounded bg-neutral px-4 text-text outline-none focus:ring-2 focus:ring-primary"
                    onChange={(event) =>
                      setEditGroupForm((form) => ({
                        ...form,
                        name: event.target.value,
                      }))
                    }
                    value={editGroupForm.name}
                  />
                </label>

                <label>
                  <span className="text-xs font-bold uppercase tracking-widest text-text">
                    Location
                  </span>
                  <input
                    className="mt-2 h-11 w-full rounded bg-neutral px-4 text-text outline-none focus:ring-2 focus:ring-primary"
                    onChange={(event) =>
                      setEditGroupForm((form) => ({
                        ...form,
                        location: event.target.value,
                      }))
                    }
                    value={editGroupForm.location}
                  />
                </label>

                <label>
                  <span className="text-xs font-bold uppercase tracking-widest text-text">
                    Budget Limit
                  </span>
                  <input
                    className="mt-2 h-11 w-full rounded bg-neutral px-4 text-text outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                    onChange={(event) =>
                      setEditGroupForm((form) => ({
                        ...form,
                        budgetLimit: event.target.value,
                      }))
                    }
                    type="number"
                    value={editGroupForm.budgetLimit}
                  />
                </label>

                <label>
                  <span className="text-xs font-bold uppercase tracking-widest text-text">
                    Exchange Date
                  </span>
                  <input
                    className="mt-2 h-11 w-full rounded bg-neutral px-4 text-text outline-none focus:ring-2 focus:ring-primary"
                    onChange={(event) =>
                      setEditGroupForm((form) => ({
                        ...form,
                        eventDate: event.target.value,
                      }))
                    }
                    type="date"
                    value={editGroupForm.eventDate}
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-widest text-text">
                  Description & Rules
                </span>
                <textarea
                  className="mt-2 h-20 w-full resize-none rounded bg-neutral px-4 py-3 text-text outline-none focus:ring-2 focus:ring-primary"
                  onChange={(event) =>
                    setEditGroupForm((form) => ({
                      ...form,
                      description: event.target.value,
                    }))
                  }
                  value={editGroupForm.description}
                />
              </label>

              <div className="mt-5 flex justify-end">
                <button
                  className="h-11 w-full cursor-pointer rounded bg-primary px-6 font-extrabold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  disabled={saveStatus === "loading"}
                  onClick={saveGroupDetails}
                >
                  {saveStatus === "loading" ? "Saving..." : "Save Details"}
                </button>
              </div>
            </section>
          ) : null}

          {isAdmin && joinRequests.length > 0 ? (
            <section className="mb-6 rounded-lg border border-border bg-surface p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <h2 className="font-heading text-xl font-extrabold text-text">
                  Join Requests
                </h2>
                <span className="rounded bg-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                  {joinRequests.length} Pending
                </span>
              </div>

              <div className="space-y-3">
                {joinRequests.map((request) => {
                  const name = request.user.displayName || request.user.email;
                  return (
                    <div
                      key={request.id}
                      className="grid gap-4 rounded bg-neutral px-4 py-3 sm:grid-cols-[auto_minmax(0,1fr)] lg:flex lg:flex-wrap lg:items-center"
                    >
                      <div className="flex size-11 items-center justify-center rounded-xl bg-border font-extrabold text-text">
                        {getInitials(name)}
                      </div>
                      <div className="min-w-0">
                        <p className="break-words font-extrabold text-text">{name}</p>
                        <p className="break-words text-sm text-text-muted">{request.user.email}</p>
                      </div>
                      <button
                        className="h-10 cursor-pointer rounded bg-primary px-4 font-extrabold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-1 lg:ml-auto"
                        disabled={
                          activeRequestId === request.id &&
                          activeRequestAction === "accept"
                        }
                        onClick={() => acceptJoinRequest(request.id)}
                      >
                        {activeRequestId === request.id &&
                        activeRequestAction === "accept"
                          ? "Accepting..."
                          : "Accept"}
                      </button>
                      <button
                        className="h-10 cursor-pointer rounded border border-border px-4 font-extrabold text-text hover:bg-tertiary disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-1"
                        disabled={
                          activeRequestId === request.id &&
                          activeRequestAction === "decline"
                        }
                        onClick={() => declineJoinRequest(request.id)}
                      >
                        {activeRequestId === request.id &&
                        activeRequestAction === "decline"
                          ? "Declining..."
                          : "Decline"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="relative overflow-hidden rounded-lg border-b-4 border-secondary bg-primary p-6 text-background shadow-md">
              <h2 className="font-heading text-2xl font-extrabold">
                Your Secret Match
              </h2>
              <p className="mt-3 max-w-sm text-base text-background/75">
                {matches.length
                  ? "The draw is complete. Reveal who you'll be surprising this year."
                  : "Run matches when your participant list is ready."}
              </p>
              {isMatchRevealed ? (
                <button
                  className="mt-6 flex w-full max-w-sm animate-[matchReveal_500ms_ease-out] cursor-pointer items-center gap-4 rounded-lg bg-neutral p-4 text-left text-text shadow-lg transition hover:-translate-y-0.5 hover:bg-tertiary"
                  onClick={() => {
                    if (myMatchMember) router.push(`/profile/${myMatchMember.userId}`);
                  }}
                  type="button"
                >
                  <div className="flex size-14 items-center justify-center rounded-xl bg-tertiary text-lg font-extrabold text-primary">
                    {myMatchMember?.user?.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={myMatchName}
                        className="size-full rounded-xl object-cover"
                        src={myMatchMember.user.icon}
                      />
                    ) : (
                      getInitials(myMatchName)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
                      Your Match
                    </p>
                    <p className="break-words text-xl font-extrabold text-primary">{myMatchName}</p>
                    <p className="break-words text-sm text-text">
                      {myMatchMember?.user?.email ?? "Profile hidden until invite accepted"}
                    </p>
                  </div>
                </button>
              ) : (
                <button
                  className="mt-6 h-12 w-full cursor-pointer rounded bg-neutral px-8 text-base font-extrabold text-text hover:bg-tertiary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  disabled={!matches.length || isMatchRevealing}
                  onClick={revealMatch}
                >
                  {isMatchRevealing ? "Drawing..." : "Reveal Match"}
                </button>
              )}
              <Gift
                size={88}
                className="absolute bottom-8 right-8 text-background/20"
              />
            </section>

            <section className="rounded-lg bg-surface p-6">
              <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
                <div className="min-w-0">
                  <p className="text-sm uppercase tracking-widest text-text">Budget</p>
                  <p className="mt-2 break-words text-2xl font-extrabold text-primary">
                    ${(group.budgetLimit ?? 0).toFixed(2)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm uppercase tracking-widest text-text">
                    Exchange Date
                  </p>
                  <p className="mt-2 break-words text-2xl font-extrabold text-primary">
                    {group.eventDate
                      ? new Date(group.eventDate).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                        })
                      : "Not set"}
                  </p>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
                <MapPin size={26} className="text-primary" />
                <p className="min-w-0 break-words text-lg">{group.location || "Location not set"}</p>
              </div>
            </section>
          </div>

          <section className="mt-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-2xl font-extrabold text-text">
                Participants
              </h2>
              <span className="inline-flex items-center gap-3 rounded bg-border px-4 py-3 text-lg">
                <Users size={21} />
                {members.length} Members
              </span>
            </div>

            <div className="rounded-lg bg-surface p-3">
              {members.map((member) => {
                const name = member.user?.displayName || member.user?.email || member.userId;
                const familyName =
                  families.find((family) => family.id === member.familyId)?.name ?? "None";

                return (
                  <div
                    key={member.id}
                    className="grid w-full cursor-pointer gap-4 rounded bg-neutral px-4 py-4 text-left transition hover:bg-tertiary sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center lg:flex lg:gap-5 lg:px-5 lg:py-3"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/profile/${member.userId}`);
                      }
                    }}
                    onClick={() => router.push(`/profile/${member.userId}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex size-12 items-center justify-center rounded-xl bg-border text-lg font-extrabold text-text">
                      {member.user?.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt={name}
                          className="size-full rounded-xl object-cover"
                          src={member.user.icon}
                        />
                      ) : (
                        getInitials(name)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-lg font-extrabold text-text">{name}</p>
                      <p className="break-words text-sm text-text-muted">{member.user?.email}</p>
                    </div>
                    <label
                      className="relative sm:col-span-2 lg:col-span-1 lg:ml-auto"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <select
                        aria-label={`Assign ${name} to family`}
                        className={
                          familyName === "None"
                            ? "h-9 w-full cursor-pointer appearance-none rounded-xl bg-border px-4 pr-9 text-xs font-bold uppercase tracking-widest text-text outline-none hover:bg-tertiary lg:w-auto"
                            : "h-9 w-full cursor-pointer appearance-none rounded-xl bg-primary/20 px-4 pr-9 text-xs font-bold uppercase tracking-widest text-primary outline-none hover:bg-tertiary lg:w-auto"
                        }
                        disabled={!isAdmin || familyStatus === "loading"}
                        onChange={(event) => assignFamily(member.id, event.target.value)}
                        onClick={(event) => event.stopPropagation()}
                        value={familyName}
                      >
                        {familyNames.map((family) => (
                          <option key={family} value={family}>
                            {family}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text"
                        size={15}
                      />
                    </label>

                    <span className="w-fit rounded-xl bg-primary/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary">
                      joined
                    </span>
                    <button
                      aria-label={`Remove ${name}`}
                      className="cursor-pointer text-text hover:text-secondary"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <UserMinus size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside
          className={
            isChatFullscreen
              ? "fixed left-1/2 top-1/2 z-40 flex h-[min(820px,calc(100vh-4rem))] w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-neutral shadow-2xl"
              : "hidden min-h-0 overflow-hidden rounded-lg border border-border bg-neutral shadow-sm xl:flex xl:flex-col"
          }
        >
          <div className="flex shrink-0 items-start justify-between border-b border-border bg-neutral p-5">
            <div>
              <h2 className="text-xl font-extrabold text-text">Group Chat</h2>
              <p className="text-text">
                {chatConnectionStatus === "open"
                  ? "Live connection active"
                  : chatConnectionStatus === "connecting"
                    ? "Connecting live chat..."
                    : "Offline fallback active"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label={
                  isChatFullscreen ? "Exit fullscreen chat" : "Open fullscreen chat"
                }
                className="cursor-pointer text-text hover:text-primary"
                onClick={() =>
                  setIsChatFullscreen((currentValue) => !currentValue)
                }
              >
                {isChatFullscreen ? <Minimize2 size={24} /> : <Expand size={24} />}
              </button>
              <button className="cursor-pointer text-text hover:text-primary">
                <MoreVertical size={24} />
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 bg-surface">
            <div
              ref={chatScrollRef}
              className={
                isChatFullscreen
                  ? "h-full space-y-5 overflow-y-auto px-8 py-6"
                  : "h-full space-y-7 overflow-y-auto p-6"
              }
              onScroll={handleChatScroll}
            >
              {chatMessages.map((chatMessage, index) => {
                const author =
                  chatMessage.author ||
                  chatMessage.senderUser?.displayName ||
                  chatMessage.senderUser?.email ||
                  "Member";
                const text = chatMessage.text || chatMessage.content || "";
                const isSelf =
                  chatMessage.tone === "self" || chatMessage.senderUserId === user?.id;
                const time = chatMessage.time
                  ? chatMessage.time
                  : chatMessage.createdAt
                    ? new Date(chatMessage.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                return (
                  <div key={chatMessage.id ?? `${author}-${index}`}>
                    <div
                      className={
                        isSelf
                          ? "mb-2 flex justify-end gap-3 text-sm"
                          : "mb-2 flex gap-3 text-sm"
                      }
                    >
                      <span className="font-bold text-text">{author}</span>
                      <span>{time}</span>
                    </div>
                    <p
                      className={
                        isSelf
                          ? "ml-auto max-w-[70%] rounded-lg bg-primary p-4 text-base text-background"
                          : "max-w-[70%] rounded-lg bg-border p-4 text-base text-text"
                      }
                    >
                      {text}
                    </p>
                  </div>
                );
              })}
            </div>

            {hasUnreadRecentMessages ? (
              <button
                className="absolute bottom-4 right-4 z-10 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary px-4 text-sm font-extrabold text-background shadow-lg hover:opacity-90"
                onClick={scrollChatToBottom}
                type="button"
              >
                <ChevronDown size={17} />
                Go to recent
              </button>
            ) : null}
          </div>

          <div className="flex shrink-0 gap-3 border-t border-border bg-neutral p-5">
            <input
              className="h-12 min-w-0 flex-1 rounded bg-surface px-5 text-base outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary"
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
              placeholder="Type a message..."
              value={message}
            />
            <button
              aria-label="Send message"
              className="flex size-11 cursor-pointer items-center justify-center rounded bg-primary text-background hover:opacity-90"
              onClick={sendMessage}
            >
              <Send size={20} />
            </button>
          </div>
        </aside>

        {!isChatFullscreen ? (
          <button
            className="fixed bottom-20 right-6 z-30 flex size-12 cursor-pointer items-center justify-center rounded-full bg-primary text-background shadow-lg hover:opacity-90 xl:hidden"
            onClick={() => setIsChatFullscreen(true)}
            aria-label="Open fullscreen chat"
          >
            <Expand size={22} />
          </button>
        ) : null}
      </section>

      <AddFamilyModal
        isOpen={isAddFamilyOpen}
        participants={participants}
        onSave={addFamily}
        onClose={() => setIsAddFamilyOpen(false)}
      />
    </>
  );
}
