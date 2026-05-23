"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Pencil,
  Expand,
  Minimize2,
  Gift,
  MapPin,
  MoreVertical,
  RefreshCw,
  Send,
  ShieldCheck,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import AddFamilyModal from "./add-family-modal";
import {
  deleteMockGroup,
  getMockGroups,
  MockParticipant,
  MockGroup,
  updateMockGroup,
  useMockGroups,
} from "@/src/features/groups/mock-group-store";

function pickRandomParticipant(participants: MockParticipant[]) {
  return participants[Math.floor(Math.random() * participants.length)];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function GroupDetailView() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const socketRef = useRef<WebSocket | null>(null);
  const inviteFeedbackTimeoutRef = useRef<number | null>(null);
  const groups = useMockGroups();
  const group = groups.find((storedGroup) => storedGroup.id === params.groupId) ?? null;
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
  const [socketStatus, setSocketStatus] = useState<"connecting" | "open" | "closed">(
    "connecting",
  );

  useEffect(() => {
    const groupId = params.groupId;
    const wsBaseUrl =
      process.env.NEXT_PUBLIC_WS_URL ??
      `${window.location.protocol === "https:" ? "wss" : "ws"}://localhost:5001`;
    const socket = new WebSocket(`${wsBaseUrl}/api/groups/${groupId}/chat/ws`);

    socketRef.current = socket;

    socket.onopen = () => setSocketStatus("open");
    socket.onclose = () => setSocketStatus("closed");
    socket.onerror = () => setSocketStatus("closed");
    socket.onmessage = (event) => {
      const incomingMessage = JSON.parse(event.data);
      const currentGroup = getMockGroups().find(
        (storedGroup) => storedGroup.id === groupId,
      );
      if (!currentGroup) return;

      updateMockGroup({
        ...currentGroup,
        chatMessages: [...currentGroup.chatMessages, incomingMessage],
      });
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [params.groupId]);

  useEffect(() => {
    return () => {
      if (inviteFeedbackTimeoutRef.current) {
        window.clearTimeout(inviteFeedbackTimeoutRef.current);
      }
    };
  }, []);

  function saveGroup(nextGroup: MockGroup) {
    updateMockGroup(nextGroup);
  }

  async function copyInviteLink() {
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

  function acceptJoinRequest(requestId: string) {
    if (!group) return;

    const request = group.joinRequests.find(
      (joinRequest) => joinRequest.id === requestId,
    );
    if (!request) return;

    saveGroup({
      ...group,
      joinRequests: group.joinRequests.filter(
        (joinRequest) => joinRequest.id !== requestId,
      ),
      participants: [
        ...group.participants,
        {
          initials: getInitials(request.name),
          name: request.name,
          email: request.email,
          status: "joined",
          family: "None",
          color: "bg-border text-text",
        },
      ],
    });
  }

  function declineJoinRequest(requestId: string) {
    if (!group) return;

    saveGroup({
      ...group,
      joinRequests: group.joinRequests.filter(
        (joinRequest) => joinRequest.id !== requestId,
      ),
    });
  }

  function assignFamily(email: string, family: string) {
    if (!group) return;

    saveGroup({
      ...group,
      participants: group.participants.map((participant) =>
        participant.email === email ? { ...participant, family } : participant,
      ),
    });
  }

  function addFamily(familyName: string, participantEmails: string[]) {
    if (!group) return;

    saveGroup({
      ...group,
      families: Array.from(new Set([...group.families, familyName])),
      participants: group.participants.map((participant) =>
        participantEmails.includes(participant.email)
          ? { ...participant, family: familyName }
          : participant,
      ),
    });
  }

  function rerollMatches() {
    if (!group) return;

    const joinedParticipants = group.participants.filter(
      (participant) => participant.status === "joined",
    );
    const nextMatch = pickRandomParticipant(joinedParticipants);

    saveGroup({
      ...group,
      isLocked: true,
      status: "matched",
      matchName: nextMatch?.name ?? group.matchName,
    });
    setIsMatchRevealed(false);
  }

  function deleteGroup() {
    if (!group) return;

    deleteMockGroup(group.id);
    router.push("/groups");
  }

  function startEditingGroup() {
    if (!group) return;

    setEditGroupForm({
      name: group.name,
      budgetLimit: String(group.budgetLimit),
      eventDate: group.eventDate,
      location: group.location,
      description: group.description,
    });
    setIsEditingGroup(true);
  }

  function saveGroupDetails() {
    if (!group) return;

    saveGroup({
      ...group,
      name: editGroupForm.name.trim() || group.name,
      budgetLimit: Number(editGroupForm.budgetLimit) || 0,
      eventDate: editGroupForm.eventDate,
      location: editGroupForm.location.trim() || "Location not set",
      description: editGroupForm.description,
    });
    setIsEditingGroup(false);
  }

  function revealMatch() {
    if (group?.status !== "matched") return;

    setIsMatchRevealing(true);
    setIsMatchRevealed(false);
    window.setTimeout(() => {
      setIsMatchRevealing(false);
      setIsMatchRevealed(true);
    }, 900);
  }

  function sendMessage() {
    const text = message.trim();
    if (!group || !text) return;

    const outgoingMessage = {
      author: "Me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text,
      tone: "self" as const,
    };

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(outgoingMessage));
    } else {
      saveGroup({
        ...group,
        chatMessages: [...group.chatMessages, outgoingMessage],
      });
    }

    setMessage("");
  }

  if (!group) {
    return (
      <section className="h-full bg-background px-10 py-8 text-text">
        <h1 className="font-heading text-3xl font-extrabold text-primary">
          Group not found
        </h1>
        <Link className="mt-4 inline-block font-bold hover:text-primary" href="/groups">
          Back to groups
        </Link>
      </section>
    );
  }

  const isAdmin = group.adminId === "user-1";
  const chatConnectionStatus = socketStatus;

  return (
    <>
      {isChatFullscreen ? (
        <button
          aria-label="Close fullscreen chat backdrop"
          className="fixed inset-0 z-30 cursor-default bg-black/35 backdrop-blur-sm"
          onClick={() => setIsChatFullscreen(false)}
        />
      ) : null}
      <section className="grid h-full overflow-hidden bg-background px-6 py-6 text-text md:px-10 xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-8">
        <div className="min-h-0 overflow-y-auto pr-2">
          <div className="mb-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-text">
              <Link className="cursor-pointer hover:text-primary" href="/groups">
                Groups
              </Link>{" "}
              <span className="mx-2 text-text-muted">›</span>
              <span>{group.name}</span>
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <h1 className="font-heading text-3xl font-extrabold text-primary">
                {group.name}
              </h1>
              {isAdmin ? (
                <span className="rounded-sm border border-text-muted px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                  Admin
                </span>
              ) : null}
              <span className="ml-auto rounded-xl bg-primary/20 px-4 py-2 text-sm font-extrabold uppercase tracking-widest text-primary">
                {group.status}
              </span>
              <div className="flex -space-x-2">
                {group.participants.slice(0, 3).map((participant) => (
                  <span
                    key={participant.email}
                    className="flex size-9 items-center justify-center rounded-full bg-border text-xs font-bold text-text ring-2 ring-background"
                  >
                    {participant.initials}
                  </span>
                ))}
                <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-background ring-2 ring-background">
                  +{Math.max(group.participants.length - 3, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-neutral p-4">
            <div className="flex items-center gap-4 font-extrabold">
              <ShieldCheck size={26} className="text-primary" />
              {isAdmin ? "Administrative Actions" : "Group Actions"}
            </div>
            <div className="ml-auto flex flex-wrap gap-3">
              <button
                className={
                  inviteCopyStatus === "copied"
                    ? "inline-flex h-11 cursor-pointer items-center gap-3 rounded border border-primary/40 bg-primary/20 px-4 font-bold text-primary"
                    : inviteCopyStatus === "failed"
                      ? "inline-flex h-11 cursor-pointer items-center gap-3 rounded border border-secondary/50 bg-tertiary px-4 font-bold text-secondary"
                      : "inline-flex h-11 cursor-pointer items-center gap-3 rounded border border-border px-4 font-bold hover:bg-surface"
                }
                onClick={copyInviteLink}
              >
                {inviteCopyStatus === "copied" ? (
                  <Check size={18} />
                ) : (
                  <UserPlus size={18} />
                )}
                {inviteCopyStatus === "copied"
                  ? "Copied"
                  : inviteCopyStatus === "failed"
                    ? "Copy failed"
                    : "Copy Code"}
              </button>
              {isAdmin ? (
                <>
                  <button
                    className="inline-flex h-11 cursor-pointer items-center gap-3 rounded border border-border px-4 font-bold hover:bg-surface"
                    onClick={startEditingGroup}
                  >
                    <Pencil size={18} />
                    Edit Group
                  </button>
                  <button
                    className="inline-flex h-11 cursor-pointer items-center gap-3 rounded border border-border px-4 font-bold hover:bg-surface"
                    onClick={() => setIsAddFamilyOpen(true)}
                  >
                    <Users size={18} />
                    Add Family
                  </button>
                  <button
                    className="inline-flex h-11 cursor-pointer items-center gap-3 rounded border border-border px-4 font-bold hover:bg-surface"
                    onClick={rerollMatches}
                  >
                    <RefreshCw size={18} />
                    Reroll Matches
                  </button>
                  <button
                    className="inline-flex h-11 cursor-pointer items-center gap-3 rounded border border-secondary/50 px-4 font-bold text-secondary hover:bg-tertiary"
                    onClick={deleteGroup}
                  >
                    <Trash2 size={18} />
                    Delete Group
                  </button>
                </>
              ) : null}
            </div>
          </div>

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
                  className="h-11 cursor-pointer rounded bg-primary px-6 font-extrabold text-background hover:opacity-90"
                  onClick={saveGroupDetails}
                >
                  Save Details
                </button>
              </div>
            </section>
          ) : null}

          {isAdmin && group.joinRequests.length > 0 ? (
            <section className="mb-6 rounded-lg border border-border bg-surface p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="font-heading text-xl font-extrabold text-text">
                  Join Requests
                </h2>
                <span className="rounded bg-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                  {group.joinRequests.length} Pending
                </span>
              </div>

              <div className="space-y-3">
                {group.joinRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-wrap items-center gap-4 rounded bg-neutral px-4 py-3"
                  >
                    <div className="flex size-11 items-center justify-center rounded-xl bg-border font-extrabold text-text">
                      {getInitials(request.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-text">{request.name}</p>
                      <p className="text-sm text-text-muted">{request.email}</p>
                    </div>
                    <button
                      className="h-10 cursor-pointer rounded bg-primary px-4 font-extrabold text-background hover:opacity-90"
                      onClick={() => acceptJoinRequest(request.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="h-10 cursor-pointer rounded border border-border px-4 font-extrabold text-text hover:bg-tertiary"
                      onClick={() => declineJoinRequest(request.id)}
                    >
                      Decline
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="relative overflow-hidden rounded-lg border-b-4 border-secondary bg-primary p-6 text-background shadow-md">
              <h2 className="font-heading text-2xl font-extrabold">
                Your Secret Match
              </h2>
              <p className="mt-3 max-w-sm text-base text-background/75">
                {group.status === "matched"
                  ? "The draw is complete. Reveal who you'll be surprising this year."
                  : "Run matches when your participant list is ready."}
              </p>
              {isMatchRevealed ? (
                <div className="mt-6 flex max-w-sm animate-[matchReveal_500ms_ease-out] items-center gap-4 rounded-lg bg-neutral p-4 text-text shadow-lg">
                  <div className="flex size-14 items-center justify-center rounded-xl bg-tertiary text-lg font-extrabold text-primary">
                    {group.matchName
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
                      Your Match
                    </p>
                    <p className="text-xl font-extrabold text-primary">
                      {group.matchName || "No match yet"}
                    </p>
                    <p className="text-sm text-text">
                      {group.participants.find(
                        (participant) => participant.name === group.matchName,
                      )?.email ?? "Profile hidden until invite accepted"}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  className="mt-6 h-12 cursor-pointer rounded bg-neutral px-8 text-base font-extrabold text-text hover:bg-tertiary disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={group.status !== "matched" || isMatchRevealing}
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
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm uppercase tracking-widest text-text">
                    Budget
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-primary">
                    ${group.budgetLimit.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-widest text-text">
                    Exchange Date
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-primary">
                    {group.eventDate
                      ? new Date(`${group.eventDate}T00:00:00`).toLocaleDateString(
                          "en-AU",
                          { day: "numeric", month: "short" },
                        )
                      : "Not set"}
                  </p>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
                <MapPin size={26} className="text-primary" />
                <p className="text-lg">{group.location}</p>
              </div>
            </section>
          </div>

          <section className="mt-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-heading text-2xl font-extrabold text-text">
                Participants
              </h2>
              <span className="inline-flex items-center gap-3 rounded bg-border px-4 py-3 text-lg">
                <Users size={21} />
                {group.participants.length} Members
              </span>
            </div>

            <div className="rounded-lg bg-surface p-3">
              {group.participants.map((participant) => (
                <div
                  key={participant.email}
                  className="flex items-center gap-5 rounded bg-neutral px-5 py-3"
                >
                  <div
                    className={`flex size-12 items-center justify-center rounded-xl text-lg font-extrabold ${participant.color}`}
                  >
                    {participant.initials}
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-text">
                      {participant.name}
                    </p>
                    <p className="text-sm text-text-muted">{participant.email}</p>
                  </div>
                  <label className="relative ml-auto">
                    <select
                      aria-label={`Assign ${participant.name} to family`}
                      className={
                        participant.family === "None"
                          ? "h-9 cursor-pointer appearance-none rounded-xl bg-border px-4 pr-9 text-xs font-bold uppercase tracking-widest text-text outline-none hover:bg-tertiary"
                          : "h-9 cursor-pointer appearance-none rounded-xl bg-primary/20 px-4 pr-9 text-xs font-bold uppercase tracking-widest text-primary outline-none hover:bg-tertiary"
                      }
                      disabled={!isAdmin}
                      onChange={(event) =>
                        assignFamily(participant.email, event.target.value)
                      }
                      value={participant.family}
                    >
                      {group.families.map((family) => (
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

                  <span
                    className={
                      participant.status === "joined"
                        ? "rounded-xl bg-primary/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary"
                        : "rounded-xl bg-tertiary px-4 py-2 text-xs font-bold uppercase tracking-widest text-text"
                    }
                  >
                    {participant.status}
                  </span>
                  <button
                    aria-label={`Remove ${participant.name}`}
                    className="cursor-pointer text-text hover:text-secondary"
                  >
                    <UserMinus size={20} />
                  </button>
                </div>
              ))}
              <button className="mt-5 h-12 w-full cursor-pointer rounded font-extrabold text-text hover:bg-neutral">
                View All Participants
              </button>
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

          <div
            className={
              isChatFullscreen
                ? "min-h-0 flex-1 space-y-5 overflow-y-auto bg-surface px-8 py-6"
                : "min-h-0 flex-1 space-y-7 overflow-y-auto bg-surface p-6"
            }
          >
            {group.chatMessages.map((message) => (
              <div key={`${message.author}-${message.time}`}>
                <div
                  className={
                    message.tone === "self"
                      ? "mb-2 flex justify-end gap-3 text-sm"
                      : "mb-2 flex gap-3 text-sm"
                  }
                >
                  <span className="font-bold text-text">{message.author}</span>
                  <span>{message.time}</span>
                </div>
                <p
                  className={
                    message.tone === "self"
                      ? "ml-auto max-w-[70%] rounded-lg bg-primary p-4 text-base text-background"
                      : message.tone === "warm"
                        ? "max-w-[70%] rounded-lg bg-tertiary p-4 text-base text-text"
                        : "max-w-[70%] rounded-lg bg-border p-4 text-base text-text"
                  }
                >
                  {message.text}
                </p>
              </div>
            ))}
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
        participants={group.participants}
        onSave={addFamily}
        onClose={() => setIsAddFamilyOpen(false)}
      />
    </>
  );
}
