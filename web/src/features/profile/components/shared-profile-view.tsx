"use client";

import Image from "next/image";
import Link from "next/link";
import { Gift, PartyPopper, Shirt, Users, WheatOff } from "lucide-react";
import { useEffect, useState } from "react";
import { getAuthOptions } from "@/src/lib/api/auth-options";
import { GiftOption, Preference, User } from "@/src/lib/api/generated/client";

type SharedProfile = {
  user: User;
  giftOptions: GiftOption[];
  preferences?: Preference | null;
  activeGroupCount: number;
};

async function fetchSharedProfile(userId: string) {
  const authOptions = await getAuthOptions();
  const response = await fetch(`http://localhost:5001/api/users/${userId}/profile`, {
    ...authOptions,
    cache: "no-store",
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(payload?.error ?? "Profile unavailable");

  return payload as SharedProfile;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const preferenceRows = [
  { key: "dietary", label: "Allergies", icon: WheatOff },
  { key: "clothingSize", label: "Clothing Size", icon: Shirt },
  { key: "notes", label: "Notes", icon: PartyPopper },
] as const;

export default function SharedProfileView({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<SharedProfile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      await Promise.resolve();
      try {
        const nextProfile = await fetchSharedProfile(userId);
        if (isActive) setProfile(nextProfile);
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Profile unavailable",
          );
        }
      }
    }

    loadProfile();
    return () => {
      isActive = false;
    };
  }, [userId]);

  if (error) {
    return (
      <section className="h-full bg-background px-6 py-8 text-text md:px-[10vw]">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-heading text-3xl font-extrabold text-primary">
            Profile unavailable
          </h1>
          <p className="mt-3 text-text-muted">{error}</p>
          <Link className="mt-5 inline-block font-bold text-primary" href="/groups">
            Back to groups
          </Link>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="h-full bg-background px-6 py-8 text-text md:px-[10vw]">
        <div className="mx-auto max-w-5xl rounded-lg bg-surface p-6 font-bold text-text">
          Loading profile...
        </div>
      </section>
    );
  }

  const profileName = profile.user.displayName || profile.user.email;
  const profilePhoto = profile.user.icon ?? "";
  const profileDescription = profile.user.description?.trim();

  return (
    <section className="h-full overflow-hidden bg-background px-6 py-6 text-text md:px-[10vw]">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          className="inline-block cursor-pointer text-sm font-bold uppercase tracking-widest text-text-muted hover:text-primary"
          href="/groups"
        >
          Groups
        </Link>

        <section className="rounded-lg bg-surface p-6 md:p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl border-4 border-neutral bg-tertiary shadow-sm">
              {profilePhoto ? (
                <Image
                  alt={profileName}
                  className="object-cover"
                  fill
                  sizes="160px"
                  src={profilePhoto}
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-tertiary">
                  <div className="flex size-24 items-center justify-center rounded-full bg-neutral text-4xl font-extrabold text-primary shadow-sm">
                    {getInitials(profileName)}
                  </div>
                </div>
              )}
            </div>

            <div className="max-w-2xl flex-1">
              <h1 className="font-heading text-3xl font-extrabold text-primary">
                {profileName}
              </h1>
              <p className="mt-2 break-all text-sm text-text-muted">
                {profile.user.email}
              </p>
              <p className="mt-4 text-base leading-7 text-text">
                {profileDescription || "No profile description added yet."}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_20rem]">
          <section className="rounded-lg bg-surface p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Gift size={25} className="text-text" />
                <h2 className="font-heading text-xl font-extrabold text-text">
                  Gift Options
                </h2>
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-text-muted">
                {profile.giftOptions.length}/5
              </span>
            </div>

            <ol className="space-y-3">
              {profile.giftOptions.length ? (
                profile.giftOptions.map((gift, index) => (
                  <li
                    key={gift.id}
                    className="flex items-center gap-5 rounded bg-neutral px-5 py-3"
                  >
                    <span
                      className={
                        index === 0
                          ? "h-12 w-1 shrink-0 rounded bg-secondary"
                          : "h-12 w-1 shrink-0 rounded bg-border"
                      }
                    />
                    <div className="min-w-0">
                      <p className="text-xs uppercase text-text-muted">
                        Option {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="truncate text-base font-bold text-text">
                        {gift.name}
                      </p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="rounded bg-neutral px-5 py-4 text-text-muted">
                  No gift options added yet.
                </li>
              )}
            </ol>
          </section>

          <aside className="space-y-6">
            <section className="rounded-lg bg-surface p-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-text-muted">
                Event Status
              </h2>
              <div className="flex items-center gap-3">
                <Users size={30} className="text-primary" />
                <p>
                  <span className="mr-3 text-3xl font-extrabold text-primary">
                    {String(profile.activeGroupCount).padStart(2, "0")}
                  </span>
                  <span className="text-lg text-text">Active Groups</span>
                </p>
              </div>
            </section>

            <section className="rounded-lg bg-surface p-6">
              <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-text-muted">
                Quick Preferences
              </h2>
              <div className="space-y-4">
                {preferenceRows.map((preference) => {
                  const Icon = preference.icon;
                  const value = profile.preferences?.[preference.key];

                  return (
                    <div key={preference.key} className="flex gap-4">
                      <Icon size={24} className="mt-1 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase text-text-muted">
                          {preference.label}
                        </p>
                        <p className="font-bold text-text">{value || "Not set"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
