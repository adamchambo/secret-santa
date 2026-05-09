"use client" // Mostly used for loading states and ui. Route protection is handled through server client

import { createClient } from "@/src/lib/supabase/browser-client";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { ensureBackendUser } from "../api";

type AuthContextType = {
  user: User | null,
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const syncedUserIds = useRef(new Set<string>());
  const syncingUserIds = useRef(new Set<string>());

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (data.user) await syncUser(data.user);
      else setUser(null);
      setLoading(false);
    }
    async function syncUser(user: User) {
      if (syncedUserIds.current.has(user.id) || syncingUserIds.current.has(user.id)) return;
      syncingUserIds.current.add(user.id);
      try {
        await ensureBackendUser(user);
        syncedUserIds.current.add(user.id);
        setUser(user);
      } catch (error) {
        console.error("Failed to sync backend user:", error);
        await supabase.auth.signOut();
        setUser(null);
      } finally {
        syncingUserIds.current.delete(user.id);
      }
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (session?.user) await syncUser(session.user);
      else setUser(null);
    })

    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
