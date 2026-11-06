import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { business } from '@/config/business'
import { useLanguage } from '@/i18n/LanguageContext'
import { Logo } from './header'
import { SectionHeading } from './sections'
import { WhatsAppButton } from './whatsapp'

export function Faq() {
  const { t } = useLanguage()
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-16 sm:py-20">
      <div className="mx-auto max-w-reading px-4 sm:px-6">
        <SectionHeading id="faq-title" title={t.faq.title} />
        <Accordion type="single" collapsible className="rounded-3xl border border-border bg-card px-5 shadow-sm sm:px-7">
          {t.faq.items.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="py-5 text-left text-xl font-bold hover:no-underline">
                <span>{item.q}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-lg text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

export function Contact() {
  const { t } = useLanguage()
  return (
    <section id="contact" aria-labelledby="contact-title" className="px-4 pb-16 sm:px-6 sm:pb-20">
      <div className="relative mx-auto max-w-content overflow-hidden rounded-[2.5rem] bg-primary px-6 py-14 text-primary-foreground shadow-xl sm:px-12 sm:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-primary-foreground/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-warm/25" />
        <div className="relative flex flex-col items-center text-center">
          <div className="flex flex-col items-center">
            <h2 id="contact-title" className="font-display text-4xl font-bold sm:text-5xl">
              {t.contact.title}
            </h2>
            <p className="mt-5 max-w-reading text-xl sm:text-2xl/relaxed opacity-95">{t.contact.text}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <WhatsAppButton size="xl" className="ring-2 ring-white/30">
                {t.contact.button}
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border bg-card pb-28 sm:pb-10">
      <div className="mx-auto flex max-w-content flex-col gap-6 px-4 pt-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-lg font-semibold">{business.tagline}</p>
          <p className="max-w-md text-base text-muted-foreground">{t.footer.estimateNote}</p>
        </div>
        <div className="flex flex-col gap-2 text-lg">
          <p className="text-base font-bold uppercase tracking-wider text-muted-foreground">{t.areas.title}</p>
          <p>{Object.values(t.areas.names).join(' · ')}</p>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-content px-4 text-base text-muted-foreground sm:px-6">
        © {year} {business.name}, {t.contact.location}. {t.footer.rights}
      </p>
    </footer>
  )
}

/** Always-visible WhatsApp button on phones. */
export function MobileWhatsAppBar() {
  const { t } = useLanguage()
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur sm:hidden">
      <WhatsAppButton size="lg" className="w-full">
        {t.whatsappBook}
      </WhatsAppButton>
    </div>
  )
}
