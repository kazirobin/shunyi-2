import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { useT } from "@/lib/use-translation";
import { company } from "@/lib/data";

export function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div><Logo /><p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">{t.footer.description}</p></div>
        <div><h3 className="font-semibold">{t.footer.links}</h3><div className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground"><Link href="/products" className="hover:text-foreground">{t.nav.products}</Link><Link href="/about" className="hover:text-foreground">{t.nav.about}</Link><Link href="/contact" className="hover:text-foreground">{t.nav.contact}</Link></div></div>
        <div><h3 className="font-semibold">{t.footer.contact}</h3><div className="mt-5 space-y-3 text-sm text-muted-foreground"><p>{company.email}</p><p>{company.phone}</p><p>{company.location}</p></div></div>
      </div>
      <div className="border-t border-border"><div className="mx-auto max-w-7xl px-6 py-5 text-xs text-muted-foreground">© {new Date().getFullYear()} Shunyi Garments. {t.footer.rights}</div></div>
    </footer>
  );
}
