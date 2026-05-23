"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChevronDown, ChevronRight, Globe2, LogOut, Moon, Trash2 } from "lucide-react";
import { logoutUser } from "@/src/features/auth/api";
import {
  deleteUsersUserId,
  getUsersUserIdSettings,
  putUsersUserIdSettings,
} from "@/src/lib/api/generated/client";
import { useAuth } from "@/src/features/auth/context/auth-provider";
import { setStoredTheme, useAppTheme } from "@/src/features/settings/theme-storage";
import { getAuthOptions } from "@/src/lib/api/auth-options";

export default function SettingsView() {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useAppTheme();

  useEffect(() => {
    async function loadSettings() {
      if (!user) return;

      const settings = await getUsersUserIdSettings(user.id, await getAuthOptions()).catch(
        () => null,
      );
      if (settings?.theme) setStoredTheme(settings.theme === "DARK" ? "dark" : "light");
    }

    loadSettings();
  }, [user]);

  async function handleThemeChange(nextTheme: "light" | "dark") {
    setStoredTheme(nextTheme);
    if (!user) return;

    await putUsersUserIdSettings(
      user.id,
      { theme: nextTheme === "dark" ? "DARK" : "LIGHT", language: "EN", currency: "AUD" },
      await getAuthOptions(),
    ).catch((error) => console.error("Failed to save settings:", error));
  }

  async function handleLogout() {
    await logoutUser();
    router.push("/login");
  }

  async function handleDeleteAccount() {
    if (!user) return;
    const confirmed = window.confirm("Delete your account and local app data?");
    if (!confirmed) return;

    try {
      await deleteUsersUserId(user.id, await getAuthOptions());
    } catch (error) {
      console.error("Backend account deletion failed:", error);
    }

    window.localStorage.clear();
    await logoutUser();
    router.push("/register");
  }

  return (
    <section className="h-full overflow-hidden bg-background px-6 py-8 text-text md:px-[10vw]">
      <div className="mx-auto flex h-full max-w-4xl flex-col">
        <header className="mb-7">
          <h1 className="font-heading text-3xl font-extrabold text-primary">
            Settings
          </h1>
          <p className="mt-2 text-base text-text">
            Manage your festive preferences and account security.
          </p>
        </header>

        <div className="space-y-6">
          <section className="rounded-lg bg-surface p-6">
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-text">
              App Settings
            </h2>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-6 rounded bg-neutral p-4">
                <div className="flex items-center gap-5">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <Globe2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-text">Language</h3>
                    <p className="text-sm text-text">
                      Select your preferred display language
                    </p>
                  </div>
                </div>

                <button className="inline-flex h-11 cursor-pointer items-center gap-5 rounded-md bg-border px-4 font-semibold text-text hover:bg-tertiary">
                  English (Australia)
                  <ChevronDown size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-6 rounded bg-neutral p-4">
                <div className="flex items-center gap-5">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-tertiary text-text">
                    <Moon size={23} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-text">Appearance</h3>
                    <p className="text-sm text-text">
                      Switch between light and dark interface
                    </p>
                  </div>
                </div>

                <div className="flex rounded-2xl bg-border p-1">
                  <button
                    className={
                      theme === "light"
                        ? "h-9 cursor-pointer rounded-xl bg-neutral px-6 font-bold text-text shadow-sm"
                        : "h-9 cursor-pointer rounded-xl px-6 font-bold text-text"
                    }
                    onClick={() => handleThemeChange("light")}
                  >
                    Light
                  </button>
                  <button
                    className={
                      theme === "dark"
                        ? "h-9 cursor-pointer rounded-xl bg-neutral px-6 font-bold text-text shadow-sm"
                        : "h-9 cursor-pointer rounded-xl px-6 font-bold text-text"
                    }
                    onClick={() => handleThemeChange("dark")}
                  >
                    Dark
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg bg-surface p-6">
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-text">
              Account
            </h2>

            <div className="space-y-1">
              <button
                className="flex w-full cursor-pointer items-center justify-between gap-6 rounded bg-neutral p-4 text-left hover:bg-tertiary"
                onClick={handleLogout}
              >
                <div className="flex items-center gap-5">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-border text-text">
                    <LogOut size={23} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-text">Logout</h3>
                    <p className="text-sm text-text">
                      Sign out of your active session
                    </p>
                  </div>
                </div>
                <ChevronRight size={22} className="text-text-muted" />
              </button>

              <div className="flex items-center justify-between gap-6 rounded border-l-4 border-secondary bg-surface p-4">
                <div className="flex items-center gap-5">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-tertiary text-secondary">
                    <Trash2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-secondary">
                      Delete Account
                    </h3>
                    <p className="text-sm text-secondary">
                      Permanently remove all your data and groups
                    </p>
                  </div>
                </div>

                <button
                  className="h-11 cursor-pointer rounded-md bg-secondary px-5 font-extrabold text-background hover:opacity-90"
                  onClick={handleDeleteAccount}
                >
                  Delete
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
