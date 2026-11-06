import {
  CarFront,
  Clock,
  HandHeart,
  Hourglass,
  Repeat,
  Stethoscope,
} from 'lucide-react'

import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

export function SectionHeading({ id, title, intro, className }: { id?: string; title: string; intro?: string; className?: string }) {
  return (
    <div className={cn('mb-10 max-w-reading', className)}>
      <h2 id={id} className="font-display text-4xl font-bold sm:text-5xl">
        {title}
      </h2>
      {intro && <p className="mt-4 text-xl text-muted-foreground">{intro}</p>}
    </div>
  )
}

const serviceIcons = [CarFront, Stethoscope, HandHeart, Hourglass, Repeat, Clock]

export function Services() {
  const { t } = useLanguage()

  return (
    <section id="services" aria-labelledby="services-title" className="py-16 sm:py-20">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <SectionHeading id="services-title" title={t.services.title} intro={t.services.intro} />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.services.items.map((s, i) => {
            const Icon = serviceIcons[i] ?? CarFront
            return (
              <li key={s.title} className="rounded-3xl border border-border bg-card p-7 shadow-sm">
                <span className="mb-5 grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
                  <Icon className="size-7" aria-hidden="true" />
                </span>
                <h3 className="text-2xl font-bold">{s.title}</h3>
                <p className="mt-3 text-lg text-muted-foreground">{s.text}</p>
              </li>
            )
          })}
        </ul>

      </div>
    </section>
  )
}
