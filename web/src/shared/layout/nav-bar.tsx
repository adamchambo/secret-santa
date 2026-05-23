"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "../ui/logo";
import { Bell, Cog, CircleUserRound } from "lucide-react";
import {
  removeStoredProfilePhoto,
  storeProfilePhoto,
  useStoredProfilePhoto,
} from "@/src/features/profile/profile-storage";
import { useAuth } from "@/src/features/auth/context/auth-provider";
import { getUsersUserId } from "@/src/lib/api/generated/client";
import { getAuthOptions } from "@/src/lib/api/auth-options";

export default function NavBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const storedProfilePhoto = useStoredProfilePhoto();
  const [accountProfilePhoto, setAccountProfilePhoto] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadAccountPhoto() {
      await Promise.resolve();
      if (!isActive) return;

      if (!user) {
        setAccountProfilePhoto("");
        removeStoredProfilePhoto();
        return;
      }

      const profile = await getUsersUserId(user.id, await getAuthOptions()).catch(
        () => null,
      );
      if (!isActive) return;

      const photo = profile?.icon ?? "";
      setAccountProfilePhoto(photo);
      if (photo) storeProfilePhoto(photo);
      else removeStoredProfilePhoto();
    }

    loadAccountPhoto();

    return () => {
      isActive = false;
    };
  }, [user]);

  const profilePhoto = accountProfilePhoto || storedProfilePhoto;

  const linkClassName = (href: string) =>
    pathname === href || (href === "/groups" && pathname.startsWith("/groups/"))
      ? "cursor-pointer border-b-2 border-primary px-3 py-5 text-primary"
      : "cursor-pointer border-b-2 border-transparent px-3 py-5 text-text-muted hover:border-tertiary hover:text-primary";

  return (
    <nav className="sticky top-0 z-20 flex h-16 w-full items-center border-b border-border bg-background/95 px-6 text-text shadow-sm backdrop-blur md:px-10">
      <div id="tabs" className="flex min-w-0 flex-1 items-center gap-8">
        <div id="brand" className="flex shrink-0 items-center gap-2">
          <Logo />
          <span className="font-heading text-xl font-extrabold text-primary">
            Secret Santa
          </span>
        </div>

        <ul id="links" className="flex items-center gap-1 font-bold">
          <li>
            <Link className={linkClassName("/groups")} href="/groups">
              Groups
            </Link>
          </li>
          <li>
            <Link className={linkClassName("/profile")} href="/profile">
              Profile
            </Link>
          </li>
          <li>
            <Link className={linkClassName("/join")} href="/join">
              Join
            </Link>
          </li>
          <li>
            <Link className={linkClassName("/create")} href="/create">
              Create
            </Link>
          </li>
        </ul>
      </div>

      <div id="options" className="flex items-center">
        <ul id="icons" className="flex items-center gap-3">
          <li>
            <button
              aria-label="Notifications"
              className="flex size-10 cursor-pointer items-center justify-center rounded-full text-text-muted hover:bg-surface hover:text-primary"
            >
              <Bell size={20} />
            </button>
          </li>
          <li>
            <Link
              aria-label="Settings"
              href="/settings"
              className="flex size-10 cursor-pointer items-center justify-center rounded-full text-text-muted hover:bg-surface hover:text-primary"
            >
              <Cog size={21} />
            </Link>
          </li>
          <li>
            <Link
              aria-label="Profile"
              href="/profile"
              className="relative flex size-11 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-tertiary text-primary hover:bg-surface"
            >
              {profilePhoto ? (
                <Image
                  alt="Profile"
                  className="object-cover"
                  fill
                  sizes="44px"
                  src={profilePhoto}
                  unoptimized
                />
              ) : (
                <CircleUserRound size={24} />
              )}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
