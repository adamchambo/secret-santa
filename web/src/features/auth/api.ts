import { CreateUser, postUsers, User as AppUser } from "@/src/lib/api/generated/client";
import { createClient as createBrowserClient } from "@/src/lib/supabase/browser-client";
import { User as SupabaseUser } from "@supabase/supabase-js";

const supabaseBrowser = createBrowserClient();

export async function ensureBackendUser(user: SupabaseUser): Promise<AppUser> {
    if (!user.email) throw new Error("Supabase user is missing an email");
    const userData: CreateUser = {
        id: user.id,
        email: user.email,
    };
    const appUser = await postUsers(userData);
    if (!appUser?.id) throw new Error("Backend user sync failed");
    return appUser;
}

export async function loginUser(email: string, password: string) {
    try {
        const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.user || !data.user.email) throw new Error("Supabase login failed");
        await ensureBackendUser(data.user);
        return data.user;
    } catch (error) {
        console.error("Error logging in user:", error);
        throw error;
    }

}

export async function registerUser(email: string, password: string) {
    try {
        const { data, error } = await supabaseBrowser.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.user || !data.user.email) throw new Error("Supabase registration failed");
        await ensureBackendUser(data.user);
        return data.user;
    } catch (err) {
        console.error("Error registering user:", err);
        throw err;
    }
}

export async function logoutUser() {
    const { error } = await supabaseBrowser.auth.signOut();
    if (error) throw error;
}

export async function getCurrentUser() {
    const { data, error } = await supabaseBrowser.auth.getUser();
    if (error) throw error;
    return data.user;
}
