"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="inline-block h-10 w-10" />;
  const dark = resolvedTheme === "dark";
  return <button type="button" aria-label="Toggle color theme" onClick={() => setTheme(dark ? "light" : "dark")} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition hover:bg-muted">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>;
}
