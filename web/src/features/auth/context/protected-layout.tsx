import { createClient } from "@/src/lib/supabase/server-client";
import { redirect } from "next/navigation";
import AuthLoader from "./auth-loader";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return (
    <AuthLoader>
      {children}
    </AuthLoader>
  )
}