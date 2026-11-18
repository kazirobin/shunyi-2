import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/use-translation";

export function CtaSection() {
  const t = useT();
  return <section className="bg-primary px-6 py-20 text-primary-foreground"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.22em] opacity-75">{t.cta.eyebrow}</p><h2 className="mt-4 max-w-2xl text-3xl font-semibold sm:text-4xl">{t.cta.title}</h2><p className="mt-4 max-w-xl leading-7 opacity-80">{t.cta.description}</p></div><Link href="/contact" className="inline-flex shrink-0 items-center gap-3 rounded-full bg-background px-7 py-4 text-sm font-bold text-foreground transition hover:opacity-90">{t.cta.button}<ArrowUpRight size={17} /></Link></div></section>;
}
