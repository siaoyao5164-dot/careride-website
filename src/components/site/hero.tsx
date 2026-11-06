import { CalendarCheck, Calculator, HeartPulse, MapPin } from 'lucide-react'

import { useLanguage } from '@/i18n/LanguageContext'
import { WhatsAppButton } from './whatsapp'

const heroImg = (w: number) => `/.netlify/images?url=/img/careride-service.jpg&w=${w}&fm=webp&q=75`

export function Hero() {
  const { t } = useLanguage()
  const badgeIcons = [CalendarCheck, HeartPulse, MapPin]

  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-32 size-[34rem] rounded-full bg-secondary blur-3xl opacity-70" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-40 size-[30rem] rounded-full bg-warm-soft blur-3xl opacity-80" />
      <div className="relative mx-auto grid max-w-content items-center gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:py-20">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-base font-semibold text-secondary-foreground">
            <HeartPulse className="size-5 text-warm" aria-hidden="true" />
            {t.hero.eyebrow}
          </p>
          <h1 className="font-display text-5xl font-bold text-foreground sm:text-6xl lg:text-7xl">
            {t.hero.title}
          </h1>
          <p className="mt-6 max-w-reading text-xl text-muted-foreground sm:text-2xl/relaxed">
            {t.hero.text}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <WhatsAppButton size="xl">{t.whatsappBook}</WhatsAppButton>
            <a
              href="#booking"
              className="inline-flex h-16 items-center justify-center gap-3 rounded-full border-2 border-primary px-8 text-xl font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60"
            >
              <Calculator className="size-6" aria-hidden="true" />
              {t.hero.ctaEstimate}
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {t.hero.badges.map((b, i) => {
              const Icon = badgeIcons[i] ?? HeartPulse
              return (
                <li key={b} className="flex items-center gap-2 text-lg font-semibold">
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                  {b}
                </li>
              )
            })}
          </ul>
        </div>
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="absolute -inset-3 rotate-2 rounded-[2.5rem] bg-primary/15" aria-hidden="true" />
          <img
            src={heroImg(720)}
            srcSet={`${heroImg(480)} 480w, ${heroImg(720)} 720w, ${heroImg(1100)} 1100w`}
            sizes="(min-width: 1024px) 40vw, 92vw"
            width={1376}
            height={768}
            alt={t.hero.imageAlt}
            fetchPriority="high"
            className="relative aspect-[4/3] w-full rounded-[2rem] object-cover object-[60%_center] shadow-xl"
          />
        </div>
      </div>
    </section>
  )
}
