import Image from "next/image";
import type { Product } from "@/lib/data";
import { useT } from "@/lib/use-translation";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const t = useT();
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold tracking-widest text-foreground">0{index + 1}</span>
      </div>
      <div className="p-6"><h3 className="text-xl font-semibold">{t.productNames[product.slug as keyof typeof t.productNames]}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{t.productDescriptions[product.slug as keyof typeof t.productDescriptions]}</p></div>
    </article>
  );
}
