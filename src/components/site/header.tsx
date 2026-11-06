import { CalendarCheck, HeartHandshake, Menu, Moon, Sun } from 'lucide-react'
import { useState } from 'react'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { business } from '@/config/business'
import { useLanguage } from '@/i18n/LanguageContext'
import { languages } from '@/i18n/translations'
import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

export function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60">
      <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <HeartHandshake className="size-6" aria-hidden="true" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-2xl font-bold tracking-tight">{business.name}</span>
        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Penang</span>
      </span>
    </a>
  )
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useLanguage()
  return (
    <div role="group" aria-label={t.nav.language} className={cn('flex items-center rounded-full border border-border bg-card p-1', className)}>
      {languages.map((l, i) => (
        <span key={l.code} className="flex items-center">
          {i > 0 && <span aria-hidden="true" className="px-0.5 text-muted-foreground/50">|</span>}
          <button
            type="button"
            lang={l.htmlLang}
            onClick={() => setLang(l.code)}
            aria-pressed={lang === l.code}
            className={cn(
              'min-w-11 rounded-full px-2.5 py-1.5 text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60 motion-reduce:transition-none',
              lang === l.code ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
            )}
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  )
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const { t } = useLanguage()
  const label = theme === 'dark' ? t.theme.toLight : t.theme.toDark
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60"
    >
      {theme === 'dark' ? <Sun className="size-5" aria-hidden="true" /> : <Moon className="size-5" aria-hidden="true" />}
    </button>
  )
}

export function Header() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const links = [
    { href: '#services', label: t.nav.services },
    { href: '#booking', label: t.nav.booking },
    { href: '#register', label: t.rewards.nav },
    { href: '#faq', label: t.nav.faq },
    { href: '#contact', label: t.nav.contact },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex max-w-content items-center gap-3 px-4 py-3 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="ml-6 hidden xl:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="rounded-full px-3 py-2 text-base font-semibold text-foreground/80 transition-colors hover:bg-secondary hover:text-secondary-foreground">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:flex" />
          <ThemeToggle />
          <a
            href="#booking"
            className="hidden h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-base font-bold text-primary-foreground shadow-md shadow-primary/20 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60 motion-reduce:transition-none lg:inline-flex"
          >
            <CalendarCheck className="size-5" aria-hidden="true" />
            {t.booking.title}
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-full border border-border bg-card xl:hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60"
                aria-label={t.nav.menu}
              >
                <Menu className="size-6" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm gap-0 p-0">
              <SheetHeader className="border-b border-border p-5">
                <SheetTitle className="font-display text-2xl">{business.name}</SheetTitle>
                <SheetDescription className="text-base">{business.tagline}</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-5 p-5">
                <LanguageSwitcher className="self-start" />
                <nav aria-label="Mobile">
                  <ul className="flex flex-col">
                    {links.map((l) => (
                      <li key={l.href}>
                        <a href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-xl font-semibold hover:bg-secondary">
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
                <a
                  href="#booking"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-primary px-6 text-lg font-bold text-primary-foreground shadow-md shadow-primary/20 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60 motion-reduce:transition-none"
                >
                  <CalendarCheck className="size-6" aria-hidden="true" />
                  {t.booking.title}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="flex justify-center border-t border-border/60 px-4 py-2 sm:hidden">
        <LanguageSwitcher />
      </div>
    </header>
  )
}
