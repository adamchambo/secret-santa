"use client";

import Image from "next/image";
import { useAppTheme } from "@/src/features/settings/theme-storage";

export default function Logo({ className = "" }) {
  const theme = useAppTheme();
  const isDark = theme === "dark";

  return (
    <div className={`relative w-8 h-8 md:w-10 md:h-10 ${className}`}>
      <Image
        src={isDark ? "/pumpkin-logo.png" : "/santa-hat.png"}
        alt={isDark ? "Halloween pumpkin" : "Santa hat"}
        fill
        className="object-contain"
      />
    </div>
  );
}
