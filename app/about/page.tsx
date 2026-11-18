import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { CtaSection } from "@/components/common/cta-section";
import { useT } from "@/lib/use-translation";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  const t = useT();
  return (
    <>
      <PageHeader eyebrow={t.about.eyebrow} title={t.about.title} description={t.about.subtitle} />
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
        <div className="relative min-h-[430px] overflow-hidden rounded-3xl">
          <Image src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=85" alt="Garment production workspace" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{t.about.storyEyebrow}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{t.about.storyTitle}</h2>
          <p className="mt-6 leading-8 text-muted-foreground">{t.about.storyText}</p>
          <div className="mt-8 space-y-4">
            {[t.about.point1, t.about.point2, t.about.point3].map((point) => (
              <div key={point} className="flex items-start gap-3"><CheckCircle2 className="mt-1 shrink-0 text-primary" size={19} /><span>{point}</span></div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-muted py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2">
          <div className="rounded-3xl bg-card p-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{t.about.missionLabel}</p>
            <h3 className="mt-4 text-2xl font-semibold">{t.about.missionTitle}</h3>
            <p className="mt-4 leading-8 text-muted-foreground">{t.about.missionText}</p>
          </div>
          <div className="rounded-3xl bg-card p-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{t.about.visionLabel}</p>
            <h3 className="mt-4 text-2xl font-semibold">{t.about.visionTitle}</h3>
            <p className="mt-4 leading-8 text-muted-foreground">{t.about.visionText}</p>
          </div>
        </div>
      </section>
      <CtaSection />
    </>
  );
}
