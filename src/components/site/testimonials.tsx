import { Quote, Star } from 'lucide-react'

import { useLanguage } from '@/i18n/LanguageContext'
import { SectionHeading } from './sections'

export interface TestimonialItem {
  id: number
  name: string
  detail: string | null
  quote: string
  rating: number
}

/**
 * Customer reviews entered by the owner in the admin dashboard.
 * The section is hidden until at least one real review is published.
 */
export function Testimonials({ items }: { items: TestimonialItem[] }) {
  const { t } = useLanguage()
  if (!items.length) return null
  const s = t.rewards.testimonials
  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="bg-secondary/40 py-16 sm:py-20">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <SectionHeading id="testimonials-title" title={s.title} intro={s.intro} className="mx-auto text-center" />
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <figure className="relative flex h-full flex-col rounded-3xl border border-border bg-card p-7 shadow-sm">
                <Quote aria-hidden="true" className="absolute top-6 right-6 size-10 text-primary/15" />
                <div className="flex gap-1" role="img" aria-label={s.ratingLabel(item.rating)}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      aria-hidden="true"
                      className={i < item.rating ? 'size-6 fill-warm text-warm' : 'size-6 text-muted-foreground/40'}
                    />
                  ))}
                </div>
                <blockquote className="mt-5 grow text-xl/relaxed text-foreground">“{item.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <span
                    aria-hidden="true"
                    className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground"
                  >
                    {item.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span>
                    <span className="block text-lg font-bold">{item.name}</span>
                    {item.detail && <span className="block text-base text-muted-foreground">{item.detail}</span>}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
