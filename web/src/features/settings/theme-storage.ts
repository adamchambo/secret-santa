import { useSyncExternalStore } from "react";

export type AppTheme = "light" | "dark";

const THEME_KEY = "secret-santa.theme";
const THEME_UPDATED_EVENT = "secret-santa.theme-updated";

let cachedTheme: AppTheme | null = null;

function readTheme(): AppTheme {
  if (typeof window === "undefined") return "light";
  if (cachedTheme) return cachedTheme;

  const storedTheme = window.localStorage.getItem(THEME_KEY);
  cachedTheme = storedTheme === "dark" ? "dark" : "light";
  return cachedTheme;
}

function applyTheme(theme: AppTheme) {
  document.documentElement.dataset.theme = theme;
}

export function getStoredTheme() {
  return readTheme();
}

export function setStoredTheme(theme: AppTheme) {
  cachedTheme = theme;
  window.localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new Event(THEME_UPDATED_EVENT));
}

export function subscribeToTheme(onStoreChange: () => void) {
  function handleStorageChange() {
    cachedTheme = null;
    applyTheme(readTheme());
    onStoreChange();
  }

  applyTheme(readTheme());
  window.addEventListener(THEME_UPDATED_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(THEME_UPDATED_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}

export function useAppTheme() {
  return useSyncExternalStore(subscribeToTheme, getStoredTheme, () => "light");
}
