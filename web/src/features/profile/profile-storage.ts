import { useSyncExternalStore } from "react";

export const PROFILE_PHOTO_KEY = "secret-santa.profile-photo";
export const PROFILE_PHOTO_UPDATED_EVENT = "secret-santa.profile-photo-updated";
const PROFILE_DETAILS_KEY = "secret-santa.profile-details";

export type ProfileDetails = {
  displayName: string;
  description: string;
};

const defaultProfileDetails: ProfileDetails = {
  displayName: "",
  description: "",
};

export function getStoredProfilePhoto() {
  if (typeof window === "undefined") return "";

  return window.localStorage.getItem(PROFILE_PHOTO_KEY) ?? "";
}

function subscribeToStoredProfilePhoto(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(PROFILE_PHOTO_UPDATED_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(PROFILE_PHOTO_UPDATED_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useStoredProfilePhoto() {
  return useSyncExternalStore(
    subscribeToStoredProfilePhoto,
    getStoredProfilePhoto,
    () => "",
  );
}

export function storeProfilePhoto(photo: string) {
  window.localStorage.setItem(PROFILE_PHOTO_KEY, photo);
  window.dispatchEvent(new Event(PROFILE_PHOTO_UPDATED_EVENT));
}

export function removeStoredProfilePhoto() {
  window.localStorage.removeItem(PROFILE_PHOTO_KEY);
  window.dispatchEvent(new Event(PROFILE_PHOTO_UPDATED_EVENT));
}

export function getStoredProfileDetails() {
  if (typeof window === "undefined") return defaultProfileDetails;

  const storedDetails = window.localStorage.getItem(PROFILE_DETAILS_KEY);
  if (!storedDetails) return defaultProfileDetails;

  try {
    return JSON.parse(storedDetails) as ProfileDetails;
  } catch {
    return defaultProfileDetails;
  }
}

export function storeProfileDetails(details: ProfileDetails) {
  window.localStorage.setItem(PROFILE_DETAILS_KEY, JSON.stringify(details));
}
