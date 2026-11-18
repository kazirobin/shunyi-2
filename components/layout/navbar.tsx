"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageToggle } from "@/components/common/language-toggle";
import { useT } from "@/lib/use-translation";

export function Navbar() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: t.nav.home },
    { href: "/products", label: t.nav.products },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact }
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-9 md:flex">
          {links.map((link) => <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition hover:text-foreground">{link.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-2 md:flex"><LanguageToggle /><ThemeToggle /></div>
        <button type="button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)} className="rounded-lg border border-border p-2 md:hidden">{open ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
      {open && <div className="border-t border-border bg-background px-6 py-5 md:hidden"><nav className="flex flex-col gap-4">{links.map((link) => <Link onClick={() => setOpen(false)} key={link.href} href={link.href} className="py-1 text-sm font-medium">{link.label}</Link>)}</nav><div className="mt-4 flex gap-2"><LanguageToggle /><ThemeToggle /></div></div>}
    </header>
  );
}
