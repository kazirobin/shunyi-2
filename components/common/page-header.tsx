export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="border-b border-border bg-muted/60 px-6 py-20 text-center sm:py-24"><div className="mx-auto max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{eyebrow}</p><h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">{title}</h1><p className="mx-auto mt-6 max-w-2xl leading-8 text-muted-foreground">{description}</p></div></section>;
}
