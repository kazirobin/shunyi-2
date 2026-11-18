import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { ProductCard } from "@/components/products/product-card";
import { products } from "@/lib/data";
import { useT } from "@/lib/use-translation";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  const t = useT();
  return (
    <>
      <PageHeader eyebrow={t.products.eyebrow} title={t.products.title} description={t.products.description} />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => <ProductCard key={product.slug} product={product} index={index} />)}
        </div>
      </section>
    </>
  );
}
