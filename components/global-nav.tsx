"use client";

import { usePathname } from "next/navigation";

export function GlobalNav() {
  const pathname = usePathname();

  if (pathname === "/dashboard") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 px-4 py-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <a href="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">← Dashboard</a>
    </nav>
  );
}
