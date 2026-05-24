"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Check, KeyRound } from "lucide-react";
import { getAuthOptions } from "@/src/lib/api/auth-options";
import { useAuth } from "@/src/features/auth/context/auth-provider";
import { ensureBackendUser } from "@/src/features/auth/api";

type JoinRequestResponse = {
  status: "requested" | "already-member";
  group: { name: string };
};

export default function JoinGroupView() {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const [joinStatus, setJoinStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  async function requestToJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = inviteCode.trim();
    if (!user) return;

    try {
      await ensureBackendUser(user);
      const authOptions = await getAuthOptions({ forceRefresh: true });
      const response = await fetch("http://localhost:5001/api/groups/join-requests", {
        ...authOptions,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authOptions.headers,
        },
        body: JSON.stringify({ inviteCode: code }),
      });
      const body = await response.text();
      const payload = body ? JSON.parse(body) : null;

      if (!response.ok) {
        const message =
          payload?.error ?? payload?.message ?? "Could not request to join.";
        throw new Error(message);
      }

      const result = payload as JoinRequestResponse;
      setInviteCode("");
      setJoinStatus("success");
      setJoinMessage(
        result.status === "already-member"
          ? `You are already in ${result.group.name}.`
          : `Request sent to ${result.group.name}.`,
      );
    } catch (error) {
      setJoinStatus("error");
      setJoinMessage(
        error instanceof Error ? error.message : "Could not request to join.",
      );
    }
  }

  return (
    <section className="h-full overflow-hidden bg-background px-6 py-10 text-text md:px-[10vw]">
      <div className="mx-auto grid h-full max-w-5xl items-start gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside>
          <h1 className="font-heading text-4xl font-extrabold text-primary">
            Join Group
          </h1>
          <p className="mt-4 text-lg leading-8 text-text-muted">
            Enter the invite code from a group admin. They will review your
            request before you are added.
          </p>
        </aside>

        <form
          className="rounded-lg border border-border bg-surface p-8 shadow-sm"
          onSubmit={requestToJoin}
        >
          <div className="mb-7 border-l-4 border-secondary pl-4">
            <h2 className="font-heading text-2xl font-extrabold text-text">
              Request Access
            </h2>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
              Invite Code
            </span>
            <div className="mt-3 flex h-14 items-center gap-3 rounded-md bg-neutral px-5 focus-within:ring-2 focus-within:ring-primary">
              <KeyRound size={20} className="text-text-muted" />
              <input
                className="min-w-0 flex-1 bg-transparent font-bold uppercase tracking-widest text-text outline-none placeholder:text-text-muted"
                onChange={(event) => {
                  setInviteCode(event.target.value.trim());
                  setJoinStatus("idle");
                  setJoinMessage("");
                }}
                placeholder="WORK99"
                value={inviteCode}
              />
            </div>
          </label>

          {joinMessage ? (
            <div
              className={
                joinStatus === "error"
                  ? "mt-5 rounded border border-secondary/40 bg-tertiary px-4 py-3 font-bold text-secondary"
                  : "mt-5 rounded border border-primary/30 bg-primary/20 px-4 py-3 font-bold text-primary"
              }
            >
              {joinMessage}
            </div>
          ) : null}

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <Link
              className="cursor-pointer font-extrabold text-text hover:text-primary"
              href="/groups"
            >
              Back
            </Link>
            <button
              className="inline-flex h-12 cursor-pointer items-center gap-2 rounded bg-primary px-7 font-extrabold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!inviteCode.trim() || !user}
            >
              <Check size={18} />
              Request Join
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
