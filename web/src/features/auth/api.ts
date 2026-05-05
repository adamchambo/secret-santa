import { createClient as createBrowserClient } from "@/src/lib/supabase/browser-client";

const supabaseBrowser = createBrowserClient();

export async function login(email: string, password: string) {
    const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}