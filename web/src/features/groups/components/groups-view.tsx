"use client";

import Link from "next/link";
import { LogIn, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { getAuthOptions } from "@/src/lib/api/auth-options";
import { getGroups, Group } from "@/src/lib/api/generated/client";

export default function GroupsView() {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    let isActive = true;

    async function loadGroups() {
      await Promise.resolve();
      const response = await getGroups(await getAuthOptions({ forceRefresh: true })).catch(
        () => [],
      );
      if (!isActive) return;
      setGroups(Array.isArray(response) ? response : []);
    }

    loadGroups();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="flex h-full flex-col overflow-hidden bg-background px-6 py-8 text-text md:px-[8vw] lg:px-[10vw]">
      <div className="mb-8 flex w-full max-w-6xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-primary">
            Active Groups
          </h1>
          <p className="mt-2 text-base text-text">
            Manage your holiday gift exchanges
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-extrabold text-background shadow-sm hover:opacity-90"
            href="/join"
          >
            <LogIn size={18} />
            Join Group
          </Link>
          <Link
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-extrabold text-background shadow-sm hover:opacity-90"
            href="/create"
          >
            <Plus size={18} />
            Create New Group
          </Link>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="flex min-h-0 w-full max-w-6xl flex-1 items-center justify-center rounded-lg border border-border bg-surface p-8 text-center">
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-primary">
              No groups yet
            </h2>
            <p className="mt-2 text-text-muted">
              Create a group or request to join one with an invite code.
            </p>
          </div>
        </div>
      ) : (
        <ul className="grid min-h-0 w-full max-w-6xl flex-1 grid-cols-1 gap-6 overflow-y-auto pr-2 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <li
              key={group.id}
              className="min-h-60 rounded-lg border-l-4 border-secondary bg-neutral px-5 py-5 shadow-sm"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
              <span className="rounded-sm bg-tertiary px-3 py-1 text-xs font-bold uppercase tracking-widest text-text">
                {group.isLocked ? "matched" : "pending"}
              </span>
                <span className="text-base font-bold text-text">#{group.inviteCode}</span>
              </div>

              <h2 className="font-heading text-xl font-extrabold text-text">
                {group.name}
              </h2>
              <p className="mt-1 text-sm text-text">
                Invite code: {group.inviteCode}
              </p>

              <div className="mt-6 rounded bg-surface p-3">
                <p className="text-xs font-bold uppercase tracking-widest text-text">
                  Exchange Date
                </p>
                <p className="mt-1 text-2xl font-extrabold text-primary">
                  {group.eventDate
                    ? new Date(group.eventDate).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Date not set"}
                </p>
              </div>

              <Link
                className="mt-6 flex h-11 w-full cursor-pointer items-center justify-center rounded bg-border text-base font-extrabold text-primary hover:bg-tertiary"
                href={`/groups/${group.id}`}
              >
                View Group
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
