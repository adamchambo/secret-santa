import { redirect } from "next/navigation";
import React from "react";

export default function RootPage({ children }: { children: React.ReactNode }) {
  const user = null;
  if (user) redirect("/");
  else redirect("login");
  return (
    <div className="bg-background min-h-screen font-body">
      {children}
    </div>
  );
}
