import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ContactForm } from "@/components/contact/contact-form";
import { company } from "@/lib/data";
import { useT } from "@/lib/use-translation";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const t = useT();
  return (
    <>
      <PageHeader eyebrow={t.contact.eyebrow} title={t.contact.title} description={t.contact.description} />
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-2xl font-semibold">{t.contact.detailsTitle}</h2>
          <p className="mt-4 leading-7 text-muted-foreground">{t.contact.detailsText}</p>
          <div className="mt-9 space-y-6">
            <div className="flex gap-4"><span className="rounded-xl bg-muted p-3 text-primary"><Mail size={20} /></span><div><p className="text-sm text-muted-foreground">{t.contact.emailLabel}</p><a className="mt-1 block font-medium hover:text-primary" href={`mailto:${company.email}`}>{company.email}</a></div></div>
            <div className="flex gap-4"><span className="rounded-xl bg-muted p-3 text-primary"><Phone size={20} /></span><div><p className="text-sm text-muted-foreground">{t.contact.phoneLabel}</p><a className="mt-1 block font-medium hover:text-primary" href={`tel:${company.phone}`}>{company.phone}</a></div></div>
            <div className="flex gap-4"><span className="rounded-xl bg-muted p-3 text-primary"><MapPin size={20} /></span><div><p className="text-sm text-muted-foreground">{t.contact.locationLabel}</p><p className="mt-1 font-medium">{company.location}</p></div></div>
          </div>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
