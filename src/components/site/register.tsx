import { AlertTriangle, CheckCircle2, Gift, Loader2, Search, Ticket, UserPlus, Users } from 'lucide-react'
import { useId, useState } from 'react'

import { rewards } from '@/config/rewards'
import { useLanguage } from '@/i18n/LanguageContext'
import { lookupCustomerFn, registerCustomerFn } from '@/lib/customer.functions'
import { normalizeMobile } from '@/lib/phone'
import { formatRM } from '@/lib/pricing'
import { cn } from '@/lib/utils'
import { Field, formatDate, inputClass } from './booking'
import { SectionHeading } from './sections'

type RegField = 'name' | 'mobile' | 'referrer' | 'consent'

function RegisterForm() {
  const { t, lang } = useLanguage()
  const r = t.rewards.register
  const uid = useId()
  const fid = (n: string) => `${uid}-${n}`
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [referrer, setReferrer] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<RegField, string>>>({})
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState<{ referred: boolean } | null>(null)

  async function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (pending) return
    const e: Partial<Record<RegField, string>> = {}
    if (name.trim().length < 2) e.name = r.errors.name
    const m = normalizeMobile(mobile)
    if (!m) e.mobile = r.errors.mobile
    if (referrer.trim()) {
      const ref = normalizeMobile(referrer)
      if (!ref) e.referrer = r.errors.referrerFormat
      else if (ref === m) e.referrer = r.errors.selfReferral
    }
    if (!consent) e.consent = r.errors.consent
    setErrors(e)
    setFormError('')
    const first = Object.keys(e)[0]
    if (first) {
      ev.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setPending(true)
    try {
      const res = await registerCustomerFn({
        data: { name: name.trim(), mobile, referrerMobile: referrer.trim() || undefined, consent: true, language: lang },
      })
      if (res.ok) {
        setDone({ referred: res.referred })
        return
      }
      const map = {
        invalid_mobile: ['mobile', r.errors.mobile],
        invalid_referrer_mobile: ['referrer', r.errors.referrerFormat],
        referrer_not_found: ['referrer', r.errors.referrerNotFound],
        self_referral: ['referrer', r.errors.selfReferral],
        already_registered: ['', r.errors.alreadyRegistered],
        too_many_attempts: ['', r.errors.tooMany],
        server_error: ['', r.errors.server],
      } as const
      const [field, message] = map[res.error] ?? ['', r.errors.server]
      if (field) setErrors({ [field]: message })
      else setFormError(message)
    } catch {
      setFormError(r.errors.server)
    } finally {
      setPending(false)
    }
  }

  if (done) {
    return (
      <div role="status" className="flex flex-col gap-4 rounded-3xl border-2 border-primary bg-secondary p-6 text-secondary-foreground sm:p-8">
        <CheckCircle2 className="size-12 text-primary" aria-hidden="true" />
        <p className="font-display text-3xl font-bold">{t.rewards.promo.welcome(formatRM(rewards.welcomeAmount))}</p>
        <p className="text-lg">{r.successText(formatRM(rewards.welcomeAmount))}</p>
        {done.referred && rewards.referralRewardTrigger === 'registration' && <p className="text-lg">{r.successReferred}</p>}
        <a
          href="#booking"
          className="inline-flex min-h-14 w-fit items-center justify-center rounded-full bg-primary px-8 text-lg font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60"
        >
          {t.hero.ctaEstimate}
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <h3 className="flex items-center gap-3 font-display text-3xl font-bold">
        <UserPlus className="size-8 text-primary" aria-hidden="true" />
        {r.formTitle}
      </h3>
      <Field id={fid('name')} label={r.name} error={errors.name}>
        <input
          id={fid('name')}
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${fid('name')}-error` : undefined}
        />
      </Field>
      <Field id={fid('mobile')} label={r.mobile} hint={r.mobileHint} error={errors.mobile}>
        <input
          id={fid('mobile')}
          name="mobile"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="012-345 6789"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className={inputClass}
          aria-invalid={errors.mobile ? true : undefined}
          aria-describedby={`${fid('mobile')}-${errors.mobile ? 'error' : 'hint'}`}
        />
      </Field>
      <Field id={fid('referrer')} label={r.referrer} hint={r.referrerHint} error={errors.referrer}>
        <input
          id={fid('referrer')}
          name="referrer"
          type="tel"
          inputMode="tel"
          placeholder="012-345 6789"
          value={referrer}
          onChange={(e) => setReferrer(e.target.value)}
          className={inputClass}
          aria-invalid={errors.referrer ? true : undefined}
          aria-describedby={`${fid('referrer')}-${errors.referrer ? 'error' : 'hint'}`}
        />
      </Field>
      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-start gap-3 text-lg">
          <input
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 size-7 shrink-0 accent-[var(--primary)]"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${fid('consent')}-error` : undefined}
          />
          <span>{r.consent}</span>
        </label>
        <details className="group ml-10">
          <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-primary underline underline-offset-4">
            {t.rewards.privacy.linkText}
          </summary>
          <div className="mt-2 flex flex-col gap-2 rounded-xl bg-muted/60 p-4 text-base text-muted-foreground">
            {t.rewards.privacy.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </details>
        {errors.consent && (
          <p id={`${fid('consent')}-error`} className="flex items-center gap-1.5 text-base font-semibold text-destructive">
            <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
            {errors.consent}
          </p>
        )}
      </div>
      {formError && (
        <p role="alert" className="flex items-center gap-2 rounded-2xl border-2 border-destructive/40 bg-destructive/10 p-4 text-lg font-semibold text-destructive">
          <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
          {formError}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-16 items-center justify-center gap-3 rounded-full bg-primary px-8 text-xl font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90 disabled:opacity-70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60"
      >
        {pending ? <Loader2 className="size-6 animate-spin" aria-hidden="true" /> : <Gift className="size-6" aria-hidden="true" />}
        {pending ? r.submitting : r.submit}
      </button>
    </form>
  )
}

type LookupResult = Awaited<ReturnType<typeof lookupCustomerFn>>

function BalanceCheck() {
  const { t, lang } = useLanguage()
  const c = t.rewards.balance
  const v = t.rewards.vouchers
  const uid = useId()
  const [mobile, setMobile] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<LookupResult | null>(null)

  async function submit(ev: React.FormEvent) {
    ev.preventDefault()
    if (pending) return
    if (!normalizeMobile(mobile)) {
      setError(t.rewards.register.errors.mobile)
      return
    }
    setError('')
    setPending(true)
    try {
      setResult(await lookupCustomerFn({ data: { mobile } }))
    } catch {
      setError(v.lookupFailed)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <h3 className="flex items-center gap-3 font-display text-2xl font-bold">
        <Search className="size-7 text-primary" aria-hidden="true" />
        {c.title}
      </h3>
      <p className="text-lg text-muted-foreground">{c.intro}</p>
      <form onSubmit={submit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="grow">
          <Field id={`${uid}-m`} label={c.mobile} error={error}>
            <input
              id={`${uid}-m`}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="012-345 6789"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className={inputClass}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${uid}-m-error` : undefined}
            />
          </Field>
        </div>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            'inline-flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-primary px-6 text-lg font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60',
            error && 'sm:mb-8',
          )}
        >
          {pending && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
          {pending ? c.checking : c.submit}
        </button>
      </form>
      <div aria-live="polite">
        {result && !result.ok && <p className="text-lg text-destructive">{v.lookupFailed}</p>}
        {result?.ok && !result.registered && <p className="text-lg">{c.notRegistered}</p>}
        {result?.ok && result.registered && (
          <div className="flex flex-col gap-3 rounded-2xl bg-secondary/60 p-5">
            <p className="text-lg font-bold">{c.hello(result.name)}</p>
            {result.blocked ? (
              <p className="text-lg text-destructive">{v.blocked}</p>
            ) : (
              <>
                <p className="font-display text-3xl font-bold text-primary">{c.total(formatRM(result.balance))}</p>
                {result.vouchers.length === 0 && <p className="text-lg">{c.none}</p>}
                <ul className="flex flex-col gap-2">
                  {result.vouchers.map((x) => (
                    <li key={x.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                      <Ticket className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden="true" />
                      <span>
                        <span className="block text-lg font-bold">
                          {formatRM(x.amount)} · {v.types[x.type as keyof typeof v.types] ?? x.type}
                        </span>
                        <span className="block text-base text-muted-foreground">
                          {x.status === 'reserved' ? c.statusReserved : x.usable ? c.statusAvailable : c.statusWaiting} ·{' '}
                          {x.expiresAt ? v.expires(formatDate(x.expiresAt, lang)) : v.noExpiry}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function Register() {
  const { t } = useLanguage()
  const r = t.rewards.register
  const welcome = formatRM(rewards.welcomeAmount)
  const referral = formatRM(rewards.referralAmount)
  return (
    <section id="register" aria-labelledby="register-title" className="py-16 sm:py-20">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <SectionHeading id="register-title" title={r.title} intro={r.intro} className="mx-auto text-center" />

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <p className="flex items-center gap-4 rounded-3xl bg-primary p-6 text-xl font-bold text-primary-foreground shadow-md">
            <Gift className="size-10 shrink-0" aria-hidden="true" />
            {t.rewards.promo.welcome(welcome)}
          </p>
          <p className="flex items-center gap-4 rounded-3xl bg-warm p-6 text-xl font-bold text-white shadow-md">
            <Users className="size-10 shrink-0" aria-hidden="true" />
            {t.rewards.promo.refer(referral)}
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_1fr]">
          <RegisterForm />
          <div className="flex flex-col gap-6">
            <BalanceCheck />
            <div className="rounded-3xl border border-border bg-muted/60 p-6 sm:p-7">
              <h3 className="mb-3 text-xl font-bold">{r.rulesTitle}</h3>
              <ul className="flex flex-col gap-2 text-lg">
                {r.rules(welcome, referral, rewards.maxVouchersPerBooking).map((rule) => (
                  <li key={rule} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2.5 size-2 shrink-0 rounded-full bg-warm" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
