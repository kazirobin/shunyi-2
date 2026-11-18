"use client";

import { useLanguage } from "@/components/providers/language-provider";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  return <button type="button" onClick={() => setLanguage(language === "en" ? "zh" : "en")} className="h-10 rounded-full border border-border px-4 text-xs font-semibold transition hover:bg-muted">{language === "en" ? "中文" : "English"}</button>;
}
