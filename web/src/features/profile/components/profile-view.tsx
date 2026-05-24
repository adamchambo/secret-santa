"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Gift,
  GripVertical,
  PartyPopper,
  Pencil,
  Plus,
  Save,
  Shirt,
  Trash2,
  Users,
  WheatOff,
} from "lucide-react";
import { useAuth } from "@/src/features/auth/context/auth-provider";
import { ensureBackendUser } from "@/src/features/auth/api";
import { getAuthOptions } from "@/src/lib/api/auth-options";
import {
  deleteUsersUserIdGiftOptionsGiftOptionId,
  GiftOption,
  getGroups,
  getUsersUserId,
  getUsersUserIdGiftOptions,
  getUsersUserIdPreferences,
  postUsersUserIdGiftOptions,
  putUsersUserId,
  putUsersUserIdGiftOptionsGiftOptionId,
  putUsersUserIdPreferences,
  User as AppUser,
} from "@/src/lib/api/generated/client";
import {
  getStoredProfileDetails,
  removeStoredProfilePhoto,
  storeProfileDetails,
  storeProfilePhoto,
} from "@/src/features/profile/profile-storage";

type PreferenceForm = {
  dietary: string;
  clothingSize: string;
  notes: string;
};

const preferenceRows = [
  { key: "dietary", label: "Allergies", icon: WheatOff },
  { key: "clothingSize", label: "Clothing Size", icon: Shirt },
  { key: "notes", label: "Notes", icon: PartyPopper },
] as const;

function isAppUser(value: unknown): value is AppUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value
  );
}

function getApiErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload !== "object" || payload === null) return fallback;
  if ("error" in payload && typeof payload.error === "string") return payload.error;
  if ("message" in payload && typeof payload.message === "string") return payload.message;
  return fallback;
}

async function updateProfileUser(
  userId: string,
  data: { displayName?: string; icon?: string; description?: string },
  forceRefreshToken = false,
) {
  const authOptions = await getAuthOptions({ forceRefresh: forceRefreshToken });
  const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
    ...authOptions,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authOptions.headers,
    },
    body: JSON.stringify(data),
  });
  const body = await response.text();
  const payload = body ? JSON.parse(body) : null;

  if (!response.ok || !isAppUser(payload)) {
    const message = getApiErrorMessage(
      payload,
      `Profile save failed with status ${response.status}`,
    );
    throw new Error(
      `Profile save failed (${response.status}): ${message}. Response: ${body || "empty"}`,
    );
  }

  return payload;
}

async function updateProfileUserWithRetry(
  user: NonNullable<ReturnType<typeof useAuth>["user"]>,
  data: { displayName?: string; icon?: string; description?: string },
) {
  try {
    return await updateProfileUser(user.id, data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("(401)")) return updateProfileUser(user.id, data, true);

    const canRetry =
      message.includes("(404)") ||
      message.includes("Record to update not found") ||
      message.includes("No User found");

    if (!canRetry) throw error;

    await ensureBackendUser(user);
    return updateProfileUser(user.id, data);
  }
}

export default function ProfileView() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [giftOptions, setGiftOptions] = useState<GiftOption[]>([]);
  const [newGift, setNewGift] = useState("");
  const [draggedGiftIndex, setDraggedGiftIndex] = useState<number | null>(null);
  const [activeGroupCount, setActiveGroupCount] = useState(0);
  const [preferences, setPreferences] = useState<PreferenceForm>({
    dietary: "",
    clothingSize: "",
    notes: "",
  });
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      const options = await getAuthOptions();
      const [profileResponse, gifts, preference, groups] = await Promise.all([
        getUsersUserId(user.id, options),
        getUsersUserIdGiftOptions(user.id, options),
        getUsersUserIdPreferences(user.id, options).catch(() => null),
        getGroups(options).catch(() => []),
      ]);
      const profile = isAppUser(profileResponse)
        ? profileResponse
        : await ensureBackendUser(user);
      const giftList = Array.isArray(gifts) ? gifts : [];
      const groupList = Array.isArray(groups) ? groups : [];

      setAppUser(profile);
      setDisplayName(profile.displayName ?? "");
      setDescription(profile.description ?? getStoredProfileDetails().description);
      if (profile.icon) storeProfilePhoto(profile.icon);
      else removeStoredProfilePhoto();
      setGiftOptions([...giftList].sort((a, b) => a.priority - b.priority));
      setActiveGroupCount(groupList.length);
      setPreferences({
        dietary: preference?.dietary ?? "",
        clothingSize: preference?.clothingSize ?? "",
        notes: preference?.notes ?? "",
      });
    }

    loadProfile();
  }, [user]);

  async function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const photo = String(reader.result);
      const updatedUser = await putUsersUserId(
        user.id,
        { icon: photo },
        await getAuthOptions(),
      );
      if (!isAppUser(updatedUser)) throw new Error("Profile photo save failed");
      setAppUser(updatedUser);
      storeProfilePhoto(photo);
    };
    reader.readAsDataURL(file);
  }

  async function removeProfilePhoto() {
    if (!user) return;

    const updatedUser = await putUsersUserId(
      user.id,
      { icon: "" },
      await getAuthOptions(),
    );
    if (!isAppUser(updatedUser)) throw new Error("Profile photo removal failed");
    setAppUser(updatedUser);
    removeStoredProfilePhoto();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function saveProfileDetails() {
    if (!user) return;

    const nextDisplayName = displayName.trim();
    setProfileError("");

    try {
      const updatedUser = await updateProfileUserWithRetry(user, {
        displayName: nextDisplayName,
        description,
      });

      setAppUser(updatedUser);
      setDisplayName(updatedUser.displayName ?? "");
      setDescription(updatedUser.description ?? "");
      storeProfileDetails({
        displayName: updatedUser.displayName ?? "",
        description: updatedUser.description ?? "",
      });
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Failed to save profile details:", error);
      setProfileError(
        error instanceof Error
          ? error.message
          : "Profile changes could not be saved. Please try again.",
      );
    }
  }

  async function persistGiftOrder(options: GiftOption[]) {
    if (!user) return;
    const authOptions = await getAuthOptions();

    for (const option of options) {
      await putUsersUserIdGiftOptionsGiftOptionId(
        user.id,
        option.id,
        { priority: option.priority + 100 },
        authOptions,
      );
    }

    await Promise.all(
      options.map((option, index) =>
        putUsersUserIdGiftOptionsGiftOptionId(
          user.id,
          option.id,
          { priority: index + 1 },
          authOptions,
        ),
      ),
    );
  }

  async function reorderGiftOption(toIndex: number) {
    if (draggedGiftIndex === null || draggedGiftIndex === toIndex) return;

    const nextOptions = [...giftOptions];
    const [movedOption] = nextOptions.splice(draggedGiftIndex, 1);
    if (!movedOption) return;

    nextOptions.splice(toIndex, 0, movedOption);
    setGiftOptions(nextOptions.map((option, index) => ({ ...option, priority: index + 1 })));
    setDraggedGiftIndex(null);
    await persistGiftOrder(nextOptions);
  }

  async function addGiftOption() {
    const gift = newGift.trim();
    if (!user || !gift || giftOptions.length >= 5) return;

    const createdGift = await postUsersUserIdGiftOptions(
      user.id,
      { name: gift, priority: giftOptions.length + 1 },
      await getAuthOptions(),
    );
    setGiftOptions((currentOptions) => [...currentOptions, createdGift]);
    setNewGift("");
  }

  async function removeGiftOption(index: number) {
    const gift = giftOptions[index];
    if (!user || !gift) return;

    await deleteUsersUserIdGiftOptionsGiftOptionId(user.id, gift.id, await getAuthOptions());
    const nextOptions = giftOptions
      .filter((_, optionIndex) => optionIndex !== index)
      .map((option, optionIndex) => ({ ...option, priority: optionIndex + 1 }));
    setGiftOptions(nextOptions);
    await persistGiftOrder(nextOptions);
  }

  function updatePreference(key: keyof PreferenceForm, value: string) {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      [key]: value,
    }));
  }

  async function savePreferences() {
    if (!user) return;

    const savedPreferences = await putUsersUserIdPreferences(
      user.id,
      preferences,
      await getAuthOptions(),
    );
    setPreferences({
      dietary: savedPreferences.dietary ?? "",
      clothingSize: savedPreferences.clothingSize ?? "",
      notes: savedPreferences.notes ?? "",
    });
    setIsEditingPreferences(false);
  }

  const profilePhoto = appUser?.icon ?? "";
  const initials = (displayName || appUser?.email || user?.email || "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="h-full overflow-hidden bg-background px-6 py-6 text-text md:px-[10vw]">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-lg bg-surface p-6 md:p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl border-4 border-neutral bg-tertiary shadow-sm">
              {profilePhoto ? (
                <Image
                  alt="Profile"
                  className="object-cover"
                  fill
                  sizes="160px"
                  src={profilePhoto}
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-tertiary">
                  <div className="flex size-24 items-center justify-center rounded-full bg-neutral text-4xl font-extrabold text-primary shadow-sm">
                    {initials}
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                type="file"
              />
              <button
                aria-label="Upload profile photo"
                className="absolute bottom-2 right-2 flex size-10 cursor-pointer items-center justify-center rounded-full bg-primary text-background hover:opacity-90"
                onClick={() => fileInputRef.current?.click()}
              >
                <Pencil size={18} />
              </button>
            </div>

            <div className="max-w-2xl flex-1">
              {isEditingProfile ? (
                <div className="space-y-3">
                  <input
                    className="h-11 w-full rounded bg-neutral px-4 font-heading text-2xl font-extrabold text-primary outline-none focus:ring-2 focus:ring-primary"
                    onChange={(event) => setDisplayName(event.target.value)}
                    value={displayName}
                  />
                  <textarea
                    className="h-24 w-full resize-none rounded bg-neutral px-4 py-3 text-base leading-7 text-text outline-none focus:ring-2 focus:ring-primary"
                    onChange={(event) => setDescription(event.target.value)}
                    value={description}
                  />
                  {profileError ? (
                    <p className="text-sm font-bold text-secondary">{profileError}</p>
                  ) : null}
                </div>
              ) : (
                <>
                  <h1 className="font-heading text-3xl font-extrabold text-primary">
                    {displayName || appUser?.email}
                  </h1>
                  <p className="mt-3 text-base leading-7 text-text">{description}</p>
                </>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="inline-flex h-10 cursor-pointer items-center gap-2 rounded bg-primary px-4 text-sm font-extrabold text-background hover:opacity-90"
                  onClick={
                    isEditingProfile
                      ? saveProfileDetails
                      : () => setIsEditingProfile(true)
                  }
                >
                  {isEditingProfile ? <Save size={16} /> : <Pencil size={16} />}
                  {isEditingProfile ? "Save Profile" : "Edit Profile"}
                </button>
                {profilePhoto ? (
                  <button
                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded border border-secondary px-4 text-sm font-extrabold text-secondary hover:bg-tertiary"
                    onClick={removeProfilePhoto}
                  >
                    <Trash2 size={16} />
                    Remove Photo
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_20rem]">
          <section className="rounded-lg bg-surface p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Gift size={25} className="text-text" />
                <h2 className="font-heading text-xl font-extrabold text-text">
                  My Top 5 Gift Options
                </h2>
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-text-muted">
                {giftOptions.length}/5
              </span>
            </div>

            <ol className="space-y-3">
              {giftOptions.map((gift, index) => (
                <li
                  draggable
                  key={gift.id}
                  className={
                    draggedGiftIndex === index
                      ? "flex cursor-grabbing items-center justify-between gap-4 rounded bg-tertiary px-5 py-3 opacity-70"
                      : "flex cursor-grab items-center justify-between gap-4 rounded bg-neutral px-5 py-3"
                  }
                  onDragEnd={() => setDraggedGiftIndex(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDragStart={() => setDraggedGiftIndex(index)}
                  onDrop={() => reorderGiftOption(index)}
                >
                  <div className="flex min-w-0 items-center gap-5">
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
                      <p className="truncate text-base font-bold text-text">{gift.name}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <GripVertical size={20} className="text-text-muted" />
                    <button
                      aria-label={`Remove ${gift.name}`}
                      className="cursor-pointer text-text-muted hover:text-secondary"
                      onClick={() => removeGiftOption(index)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-4 flex gap-3">
              <input
                className="min-w-0 flex-1 rounded bg-neutral px-4 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary"
                disabled={giftOptions.length >= 5}
                onChange={(event) => setNewGift(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addGiftOption();
                }}
                placeholder={
                  giftOptions.length >= 5
                    ? "Remove one option to add another"
                    : "Add a gift option"
                }
                value={newGift}
              />
              <button
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded bg-primary px-4 text-sm font-extrabold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={giftOptions.length >= 5 || !newGift.trim()}
                onClick={addGiftOption}
              >
                <Plus size={17} />
                Add
              </button>
            </div>
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
                    {String(activeGroupCount).padStart(2, "0")}
                  </span>
                  <span className="text-lg text-text">Active Groups</span>
                </p>
              </div>
            </section>

            <section className="rounded-lg bg-surface p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">
                  Quick Preferences
                </h2>
                <button
                  className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-text hover:text-primary"
                  onClick={isEditingPreferences ? savePreferences : () => setIsEditingPreferences(true)}
                >
                  {isEditingPreferences ? <Save size={16} /> : <Pencil size={16} />}
                  {isEditingPreferences ? "Save" : "Edit"}
                </button>
              </div>

              <div className="space-y-4">
                {preferenceRows.map((preference) => {
                  const Icon = preference.icon;
                  const value = preferences[preference.key];

                  return (
                    <div key={preference.key} className="flex gap-4">
                      <Icon size={24} className="mt-1 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase text-text-muted">
                          {preference.label}
                        </p>
                        {isEditingPreferences ? (
                          <input
                            className="mt-1 h-9 w-full rounded bg-neutral px-3 font-bold text-text outline-none focus:ring-2 focus:ring-primary"
                            onChange={(event) =>
                              updatePreference(preference.key, event.target.value)
                            }
                            value={value}
                          />
                        ) : (
                          <p className="font-bold text-text">
                            {value || "Not set"}
                          </p>
                        )}
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
