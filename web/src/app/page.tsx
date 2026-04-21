import React from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen font-body">
      {children}
    </div>
  );
}
