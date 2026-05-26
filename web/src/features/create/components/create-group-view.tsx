"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Calendar } from "lucide-react";
import { ensureBackendUser } from "@/src/features/auth/api";
import { useAuth } from "@/src/features/auth/context/auth-provider";
import { getAuthOptions } from "@/src/lib/api/auth-options";
import { Group, postGroups } from "@/src/lib/api/generated/client";

function isApiGroup(value: unknown): value is Group {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "inviteCode" in value
  );
}

export default function CreateGroupView() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setError("");

    try {
      if (!user) throw new Error("You need to be logged in to create a group.");
      await ensureBackendUser(user);
      const apiGroup = await postGroups(
        {
          name: trimmedName,
          budgetLimit: Number(budgetLimit) || undefined,
          description,
          location: "Location not set",
          eventDate: eventDate ? new Date(`${eventDate}T00:00:00`).toISOString() : undefined,
        } as Parameters<typeof postGroups>[0] & {
          budgetLimit?: number;
          description?: string;
          location?: string;
        },
        await getAuthOptions({ forceRefresh: true }),
      );
      if (!isApiGroup(apiGroup)) throw new Error("Group could not be created");
      router.push(`/groups/${apiGroup.id}`);
    } catch (createError) {
      console.error("Failed to create group:", createError);
      setError(
        createError instanceof Error
          ? createError.message
          : "Group could not be created.",
      );
    }
  }

  return (
    <section className="h-full overflow-y-auto bg-background px-4 py-8 text-text sm:px-6 md:px-[10vw] md:py-12">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-10">
        <aside>
          <h1 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">
            Create Group
          </h1>
          <p className="mt-4 max-w-sm text-base leading-7 text-text sm:text-lg sm:leading-8">
            Establish your festive exchange protocol. Define the boundaries,
            dates, and spirit of your Secret Santa group.
          </p>
        </aside>

        <form
          className="rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-8"
          onSubmit={handleSubmit}
        >
          <div className="mb-8 border-l-4 border-secondary pl-4">
            <h2 className="font-heading text-2xl font-extrabold text-text">
              General Information
            </h2>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-text">
              Group Name
            </span>
            <input
              className="mt-3 h-12 w-full rounded-md bg-neutral px-4 text-base text-text outline-none placeholder:text-text-muted/40 focus:ring-2 focus:ring-primary sm:h-14 sm:px-5 sm:text-lg"
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Winter Workshop 2024"
              required
              value={name}
            />
          </label>

          <div className="mt-7 grid gap-7 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-text">
                Budget Limit ($)
              </span>
              <div className="mt-3 flex h-12 items-center rounded-md bg-neutral px-4 focus-within:ring-2 focus-within:ring-primary sm:h-14 sm:px-5">
                <span className="mr-3 text-lg font-bold text-text">$</span>
                <input
                  className="min-w-0 flex-1 bg-transparent text-base text-text outline-none placeholder:text-text-muted/40 sm:text-lg"
                  min="0"
                  onChange={(event) => setBudgetLimit(event.target.value)}
                  placeholder="50.00"
                  type="number"
                  value={budgetLimit}
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-text">
                Exchange Date
              </span>
              <div className="mt-3 flex h-12 items-center rounded-md bg-neutral px-4 focus-within:ring-2 focus-within:ring-primary sm:h-14 sm:px-5">
                <input
                  className="min-w-0 flex-1 bg-transparent text-base text-text outline-none sm:text-lg"
                  onChange={(event) => setEventDate(event.target.value)}
                  type="date"
                  value={eventDate}
                />
                <Calendar size={18} className="text-text" />
              </div>
            </label>
          </div>

          <label className="mt-7 block">
            <span className="text-xs font-bold uppercase tracking-widest text-text">
              Description & Rules
            </span>
            <textarea
              className="mt-3 h-36 w-full resize-none rounded-md bg-neutral px-4 py-4 text-base text-text outline-none placeholder:text-text-muted/40 focus:ring-2 focus:ring-primary sm:px-5 sm:text-lg"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Include any special instructions or themes..."
              value={description}
            />
          </label>

          <div className="mt-10 grid gap-3 border-t border-border pt-8 sm:flex sm:items-center sm:justify-between">
            <Link
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded border border-border px-4 text-base font-bold text-text hover:bg-tertiary hover:text-primary sm:h-auto sm:border-0 sm:py-3 sm:text-lg"
              href="/groups"
            >
              Cancel
            </Link>
            <button className="h-12 cursor-pointer rounded bg-primary px-6 text-base font-extrabold text-background shadow-md hover:opacity-90 sm:h-14 sm:px-10 sm:text-lg">
              Initialize Group
            </button>
          </div>
          {error ? <p className="mt-4 font-bold text-secondary">{error}</p> : null}
        </form>
      </div>
    </section>
  );
}
