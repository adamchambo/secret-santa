"use client";

import { useAuth } from "./auth-provider";

export default function AuthLoader({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return <>{children}</>;
}