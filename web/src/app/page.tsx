import { redirect } from "next/navigation";
import React from "react";
import { createClient } from "../lib/supabase/server-client";

export default async function RootPage({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/groups");
  else redirect("/login");
  return (
    <div className="bg-background min-h-screen font-body">
      {children}
    </div>
  );
}
