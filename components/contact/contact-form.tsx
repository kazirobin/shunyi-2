"use client";

import { FormEvent, useState } from "react";
import { useT } from "@/lib/use-translation";

export function ContactForm() {
  const t = useT();
  const [sent, setSent] = useState(false);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
  }
  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9">
      <h2 className="text-2xl font-semibold">{t.contact.formTitle}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t.contact.formText}</p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium">{t.contact.name}<input required name="name" placeholder={t.contact.namePlaceholder} className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 font-normal outline-none transition focus:border-primary" /></label>
        <label className="text-sm font-medium">{t.contact.email}<input required type="email" name="email" placeholder={t.contact.emailPlaceholder} className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 font-normal outline-none transition focus:border-primary" /></label>
      </div>
      <label className="mt-5 block text-sm font-medium">{t.contact.subject}<input name="subject" placeholder={t.contact.subjectPlaceholder} className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 font-normal outline-none transition focus:border-primary" /></label>
      <label className="mt-5 block text-sm font-medium">{t.contact.message}<textarea required name="message" rows={5} placeholder={t.contact.messagePlaceholder} className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 font-normal outline-none transition focus:border-primary" /></label>
      <button type="submit" className="mt-6 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90">{t.contact.send}</button>
      {sent && <p role="status" className="mt-4 text-sm font-medium text-primary">{t.contact.demoNotice}</p>}
    </form>
  );
}
