import { CreateUser, postUsers, User } from "@/src/lib/api/generated/client";
import { createClient as createBrowserClient } from "@/src/lib/supabase/browser-client";

const supabaseBrowser = createBrowserClient();

export async function loginUser(email: string, password: string) {
    try {
        const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.user || !data.user.email) throw new Error("Supabase login failed");
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
        const userData: CreateUser = {
            id: data.user.id,
            email: data.user.email,      
        };
        const user: User = await postUsers(userData);
        if (!user) throw new Error("User creation failed");
        return user;
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