import Link from "next/link";
import { Shirt } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Shunyi Garments home">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Shirt size={21} /></span>
      <span className="leading-tight"><span className="block text-base font-bold tracking-[0.08em]">SHUNYI</span><span className="block text-[10px] font-semibold tracking-[0.25em] text-muted-foreground">GARMENTS</span></span>
    </Link>
  );
}
