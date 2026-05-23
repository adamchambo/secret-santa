import { createClient } from "@/src/lib/supabase/browser-client";

type AuthOptionsConfig = {
  forceRefresh?: boolean;
};

export async function getAuthOptions(config: AuthOptionsConfig = {}): Promise<RequestInit> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const expiresAtMs = (data.session?.expires_at ?? 0) * 1000;
  const shouldRefresh =
    config.forceRefresh || !expiresAtMs || expiresAtMs - Date.now() < 60_000;
  const session = shouldRefresh
    ? (await supabase.auth.refreshSession()).data.session
    : data.session;
  const token = session?.access_token;

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
}
