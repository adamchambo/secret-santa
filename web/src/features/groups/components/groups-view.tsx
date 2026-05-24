"use client";

import Link from "next/link";
import { LogIn, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getAuthOptions } from "@/src/lib/api/auth-options";
import { getGroups, Group } from "@/src/lib/api/generated/client";

export default function GroupsView() {
  const [groups, setGroups] = useState<Group[]>([]);
  const tabletPlaceholderCount = groups.length > 0 ? (2 - (groups.length % 2)) % 2 : 0;
  const desktopPlaceholderCount = groups.length > 0 ? (3 - (groups.length % 3)) % 3 : 0;
  const placeholderCount = Math.max(tabletPlaceholderCount, desktopPlaceholderCount);

  const loadGroups = useCallback(async () => {
    const response = await getGroups(await getAuthOptions()).catch(
      () => [],
    );
    return Array.isArray(response) ? response : [];
  }, []);

  useEffect(() => {
    let isActive = true;

    async function refreshGroups() {
      await Promise.resolve();
      if (!isActive) return;
      const nextGroups = await loadGroups();
      if (isActive) setGroups(nextGroups);
    }

    refreshGroups();

    const refreshOnFocus = () => {
      void refreshGroups();
    };
    const refreshOnVisible = () => {
      if (document.visibilityState === "visible") void refreshGroups();
    };
    const intervalId = window.setInterval(refreshGroups, 1500);

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnVisible);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnVisible);
    };
  }, [loadGroups]);

  return (
    <section className="flex h-full flex-col overflow-hidden bg-background px-6 py-8 text-text md:px-[8vw] lg:px-[10vw]">
      <div className="mx-auto mb-8 flex w-full max-w-6xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
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
        <ul className="mx-auto grid min-h-0 w-full max-w-6xl auto-rows-max grid-cols-1 gap-6 overflow-y-auto pr-2 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <li
              key={group.id}
              className="flex h-72 flex-col rounded-lg border-l-4 border-secondary bg-neutral px-5 py-6 shadow-sm"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
              <span
                className={
                  group.isLocked
                    ? "rounded-sm bg-primary/25 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary"
                    : "rounded-sm bg-tertiary px-3 py-1 text-xs font-bold uppercase tracking-widest text-text"
                }
              >
                {group.isLocked ? "matched" : "pending"}
              </span>
              </div>

              <h2 className="font-heading text-xl font-extrabold text-text">
                {group.name}
              </h2>

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
                className="mt-auto flex h-11 w-full cursor-pointer items-center justify-center rounded bg-border text-base font-extrabold text-primary hover:bg-tertiary"
                href={`/groups/${group.id}`}
              >
                View Group
              </Link>
            </li>
          ))}
          {Array.from({ length: placeholderCount }).map((_, index) => {
            const showOnTablet = index < tabletPlaceholderCount;
            const showOnDesktop = index < desktopPlaceholderCount;

            return (
              <li
                aria-hidden="true"
                className={[
                  "hidden h-72 flex-col rounded-lg border border-dashed border-border bg-surface/60 px-5 py-6",
                  showOnTablet ? "md:flex" : "md:hidden",
                  showOnDesktop ? "xl:flex" : "xl:hidden",
                ].join(" ")}
                key={`group-placeholder-${index}`}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <span className="h-6 w-24 rounded bg-border/70" />
                  <span className="h-5 w-16 rounded bg-border/60" />
                </div>
                <span className="h-7 w-3/4 rounded bg-border/70" />
                <span className="mt-3 h-4 w-1/2 rounded bg-border/60" />
                <div className="mt-6 rounded bg-neutral p-3">
                  <span className="block h-3 w-28 rounded bg-border/60" />
                  <span className="mt-3 block h-8 w-32 rounded bg-border/70" />
                </div>
                <span className="mt-auto block h-11 w-full rounded bg-border/60" />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
