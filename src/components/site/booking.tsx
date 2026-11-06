import { AlertTriangle, CalendarClock, CheckCircle2, Gift, Loader2, Minus, Plus, Route as RouteIcon, Send, ShieldAlert, Ticket } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { toast } from 'sonner'

import { business, whatsappUrl } from '@/config/business'
import { pricing } from '@/config/pricing'
import { rewards } from '@/config/rewards'
import { useLanguage } from '@/i18n/LanguageContext'
import { languages, type Lang } from '@/i18n/translations'
import { createBookingFn, lookupCustomerFn } from '@/lib/customer.functions'
import { normalizeMobile } from '@/lib/phone'
import { mapsLink, placeLabel, type Place } from '@/lib/places'
import { applyVouchers, calculateEstimate, formatKm, formatRM, sideOf, type Estimate, type TripType } from '@/lib/pricing'
import { cn } from '@/lib/utils'
import { LocationSearch } from './location-search'
import { SectionHeading } from './sections'

type FieldName = 'pickup' | 'destination' | 'name' | 'mobile' | 'date' | 'pickupTime'
type Errors = Partial<Record<FieldName, string>>
type RouteResult = { key: string; distanceKm: number; durationMin: number } | { key: string; failed: true }

type Lookup = Awaited<ReturnType<typeof lookupCustomerFn>>
type LookupState = { mobile: string; status: 'loading' } | { mobile: string; status: 'done'; data: Lookup } | { mobile: string; status: 'failed' }
type BookingResult = Extract<Awaited<ReturnType<typeof createBookingFn>>, { ok: true }>

const routeKey = (a: Place, b: Place) => `${a.lat.toFixed(5)},${a.lng.toFixed(5)}|${b.lat.toFixed(5)},${b.lng.toFixed(5)}`
const locales: Record<Lang, string> = { en: 'en-MY', ms: 'ms-MY', zh: 'zh-CN' }

export const inputClass =
  'block h-14 w-full rounded-xl border-2 border-input bg-card px-4 text-lg text-foreground shadow-xs transition-colors placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 aria-[invalid=true]:border-destructive'

export function formatDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(locales[lang], { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

/** Earliest bookable date (YYYY-MM-DD, local time). Empty during the server render. */
function useMinDate() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      const d = new Date()
      d.setDate(d.getDate() + business.minBookingDaysAhead)
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    },
    () => '',
  )
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-lg font-bold">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-base text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-base font-semibold text-destructive">
          <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

function ChoiceGroup<T extends string>({
  legend,
  name,
  value,
  onChange,
  options,
}: {
  legend: string
  name: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-lg font-bold">{legend}</legend>
      <div className="grid grid-cols-2 gap-3">
        {options.map((o) => (
          <label key={o.value} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span className="flex h-14 items-center justify-center rounded-xl border-2 border-input bg-card px-3 text-center text-lg font-bold transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-4 peer-focus-visible:ring-ring/50 hover:border-primary/60">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn('flex items-start justify-between gap-4', strong && 'border-t border-primary-foreground/25 pt-3 font-bold')}>
      <dt>{label}</dt>
      <dd className="shrink-0 font-bold">{value}</dd>
    </div>
  )
}

function EstimatePanel({
  estimate,
  route,
  calculating,
  failed,
  balance,
  discount,
  payable,
}: {
  estimate: Estimate | null
  route: { distanceKm: number; durationMin: number } | null
  calculating: boolean
  failed: boolean
  balance: number | null
  discount: number
  payable: number | null
}) {
  const { t } = useLanguage()
  const b = t.booking
  const r = t.rewards.estimate
  return (
    <div aria-live="polite" className="flex h-full flex-col rounded-3xl bg-primary p-6 text-primary-foreground shadow-lg sm:p-8 lg:sticky lg:top-24 lg:h-auto">
      <p className="text-lg font-bold uppercase tracking-wider opacity-90">{r.finalAmount}</p>
      {estimate && payable !== null ? (
        <>
          <p className="mt-2 font-display text-6xl font-bold sm:text-7xl" data-testid="estimate-total">
            {formatRM(payable)}
          </p>
          {route && (
            <p className="mt-3 flex items-center gap-2 text-lg font-semibold">
              <RouteIcon className="size-5 shrink-0" aria-hidden="true" />
              {b.distanceLine(formatKm(route.distanceKm), route.durationMin)}
            </p>
          )}
          <dl className="mt-6 flex flex-col gap-3 border-t border-primary-foreground/25 pt-5 text-lg">
            <Line label={`${r.transportFare} (${estimate.legs === 2 ? b.roundTrip : b.oneWay})`} value={formatRM(estimate.distanceFare)} />
            {estimate.crossingCharge > 0 && <Line label={r.crossing} value={formatRM(estimate.crossingCharge)} />}
            {estimate.peak > 0 && <Line label={r.peak(estimate.peakTrips)} value={formatRM(estimate.peak)} />}
            {estimate.accompaniment > 0 && (
              <Line label={r.accompaniment(estimate.accompanimentHours)} value={formatRM(estimate.accompaniment)} />
            )}
            <Line label={r.subtotal} value={formatRM(estimate.subtotal)} strong />
            {balance !== null && <Line label={r.voucherBalance} value={formatRM(balance)} />}
            {discount > 0 && <Line label={r.voucherDiscount} value={`− ${formatRM(discount)}`} />}
            <Line label={r.finalAmount} value={formatRM(payable)} strong />
          </dl>
          {balance === null && <p className="mt-4 text-base opacity-90">{r.noBalance}</p>}
        </>
      ) : calculating ? (
        <p className="mt-4 flex items-center gap-3 text-xl opacity-95">
          <Loader2 className="size-6 animate-spin" aria-hidden="true" />
          {b.calculating}
        </p>
      ) : failed ? (
        <p className="mt-4 text-xl opacity-95">{b.distanceFailed}</p>
      ) : (
        <p className="mt-4 text-xl opacity-95">{b.chooseLocations}</p>
      )}
      <p className="mt-auto flex gap-2 pt-6 text-base opacity-90">
        <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        {b.disclaimer}
      </p>
    </div>
  )
}

function VoucherPicker({
  state,
  selected,
  onChange,
}: {
  state: LookupState | null
  selected: number[]
  onChange: (ids: number[]) => void
}) {
  const { t, lang } = useLanguage()
  const v = t.rewards.vouchers
  const max = rewards.maxVouchersPerBooking

  let body: React.ReactNode
  if (!state) body = <p className="text-lg text-muted-foreground">{v.enterMobile}</p>
  else if (state.status === 'loading')
    body = (
      <p className="flex items-center gap-2 text-lg text-muted-foreground" role="status">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        {v.checking}
      </p>
    )
  else if (state.status === 'failed' || !state.data.ok) body = <p className="text-lg text-muted-foreground">{v.lookupFailed}</p>
  else if (!state.data.registered)
    body = (
      <p className="text-lg">
        {v.notRegistered}{' '}
        <a href="#register" className="font-bold text-primary underline underline-offset-4">
          {v.registerLink(formatRM(rewards.welcomeAmount))}
        </a>
      </p>
    )
  else if (state.data.blocked) body = <p className="text-lg text-destructive">{v.blocked}</p>
  else {
    const data = state.data
    const usable = data.vouchers.filter((x) => x.usable)
    const others = data.vouchers.filter((x) => !x.usable)
    const toggle = (id: number) => {
      if (max === 1) onChange([id])
      else onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id].slice(-max))
    }
    body = (
      <div className="flex flex-col gap-3">
        <p className="text-lg font-bold">{v.hello(data.name)}</p>
        <p className="text-lg">{v.balance(formatRM(data.balance))}</p>
        {usable.length === 0 && <p className="text-lg text-muted-foreground">{v.none}</p>}
        {usable.length > 0 && (
          <fieldset className="flex flex-col gap-3">
            <legend className="sr-only">{v.title}</legend>
            {usable.map((x) => (
              <label key={x.id} className="relative cursor-pointer">
                <input
                  type={max === 1 ? 'radio' : 'checkbox'}
                  name="voucher"
                  checked={selected.includes(x.id)}
                  onChange={() => toggle(x.id)}
                  className="peer sr-only"
                />
                <span className="flex min-h-14 items-center gap-3 rounded-xl border-2 border-input bg-card px-4 py-3 transition-colors peer-checked:border-primary peer-checked:bg-secondary peer-focus-visible:ring-4 peer-focus-visible:ring-ring/50">
                  <Ticket className="size-6 shrink-0 text-primary" aria-hidden="true" />
                  <span className="grow">
                    <span className="block text-lg font-bold">
                      {formatRM(x.amount)} · {v.types[x.type as keyof typeof v.types] ?? x.type}
                    </span>
                    <span className="block text-base text-muted-foreground">
                      {x.expiresAt ? v.expires(formatDate(x.expiresAt, lang)) : v.noExpiry}
                    </span>
                  </span>
                  {selected.includes(x.id) && <CheckCircle2 className="size-6 shrink-0 text-primary" aria-hidden="true" />}
                </span>
              </label>
            ))}
            {max === 1 && (
              <label className="relative cursor-pointer">
                <input type="radio" name="voucher" checked={selected.length === 0} onChange={() => onChange([])} className="peer sr-only" />
                <span className="flex min-h-14 items-center rounded-xl border-2 border-input bg-card px-4 text-lg font-semibold transition-colors peer-checked:border-primary peer-checked:bg-secondary peer-focus-visible:ring-4 peer-focus-visible:ring-ring/50">
                  {v.useNone}
                </span>
              </label>
            )}
            <p className="text-base text-muted-foreground">{v.maxNote(max)}</p>
          </fieldset>
        )}
        {others.map((x) => (
          <p key={x.id} className="flex items-center gap-2 text-base text-muted-foreground">
            <Ticket className="size-5 shrink-0" aria-hidden="true" />
            {formatRM(x.amount)} · {v.types[x.type as keyof typeof v.types] ?? x.type} — {x.status === 'reserved' ? v.reserved : v.welcomeAfterFirstRide}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-secondary/40 p-5">
      <h4 className="mb-3 flex items-center gap-2 text-xl font-bold">
        <Gift className="size-6 text-warm" aria-hidden="true" />
        {v.title}
      </h4>
      {body}
    </div>
  )
}

function buildMessage(t: ReturnType<typeof useLanguage>['t'], lang: Lang, ctx: {
  result: BookingResult
  name: string
  pickup: Place
  destination: Place
  travelDate: string
  pickupTime: string
  returnTime: string
  tripType: TripType
}) {
  const m = t.rewards.message
  const { result } = ctx
  const e = result.estimate
  const voucherText = result.vouchers.length
    ? result.vouchers
        .map((v) => `${t.rewards.vouchers.types[v.type as keyof typeof t.rewards.vouchers.types] ?? v.type} ${v.code} (−${formatRM(v.amount)})`)
        .join(', ')
    : m.noVoucher
  const lines = [
    m.greeting,
    '',
    `${m.reference}: ${result.reference}`,
    `${m.name}: ${ctx.name.trim()}`,
    `${m.mobile}: +${result.mobile}`,
    `${m.pickup}: ${placeLabel(ctx.pickup)}`,
    `${m.pickupMap}: ${mapsLink(ctx.pickup)}`,
    `${m.destination}: ${placeLabel(ctx.destination)}`,
    `${m.destinationMap}: ${mapsLink(ctx.destination)}`,
    ...(result.distanceKm !== null && result.durationMin !== null ? [m.distance(formatKm(result.distanceKm), result.durationMin)] : []),
    `${m.date}: ${formatDate(`${ctx.travelDate}T12:00:00`, lang)}`,
    `${m.pickupTime}: ${ctx.pickupTime}`,
    `${m.tripType}: ${ctx.tripType === 'round' ? m.roundTrip : m.oneWay}`,
    ...(ctx.tripType === 'round' && ctx.returnTime ? [`${m.returnTime}: ${ctx.returnTime}`] : []),
    `${m.accompaniment}: ${e && e.accompanimentHours > 0 ? m.accompanimentHours(e.accompanimentHours) : m.none}`,
    '',
    ...(e
      ? [
          `${m.transportFare}: ${formatRM(e.distanceFare)}`,
          ...(e.crossingCharge > 0 ? [`${m.crossing}: ${formatRM(e.crossingCharge)}`] : []),
          ...(e.peak > 0 ? [`${m.peak}: ${formatRM(e.peak)}`] : []),
          ...(e.accompaniment > 0 ? [`${m.accompanimentCharge}: ${formatRM(e.accompaniment)}`] : []),
          `${m.transportSubtotal}: ${formatRM(e.subtotal)}`,
          `${m.voucher}: ${voucherText}`,
          `${m.finalFare}: ${formatRM(result.total ?? e.subtotal)}`,
        ]
      : [`${m.voucher}: ${voucherText}`, `${m.finalFare}: ${m.notAvailable}`]),
    `${m.language}: ${languages.find((l) => l.code === lang)?.label ?? 'EN'}`,
    '',
    m.closing,
  ]
  return lines.join('\n')
}

export function Booking() {
  const { t, lang } = useLanguage()
  const b = t.booking
  const rb = t.rewards.booking
  const d = t.rewards.details
  const uid = useId()
  const fid = (name: string) => `${uid}-${name}`
  const formRef = useRef<HTMLFormElement>(null)
  const minDate = useMinDate()

  const [pickup, setPickup] = useState<Place | null>(null)
  const [destination, setDestination] = useState<Place | null>(null)
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null)
  const [tripType, setTripType] = useState<TripType>('oneway')
  const [travelDate, setTravelDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [returnTime, setReturnTime] = useState('')
  const [needAccompaniment, setNeedAccompaniment] = useState<'yes' | 'no'>('no')
  const [hours, setHours] = useState<number>(pricing.accompaniment.minHours)
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [lookup, setLookup] = useState<LookupState | null>(null)
  const [selected, setSelected] = useState<number[]>([])

  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState<BookingResult | null>(null)
  const lookupTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const currentKey = pickup && destination ? routeKey(pickup, destination) : null

  // Look up the real road distance whenever both locations are chosen.
  useEffect(() => {
    if (!pickup || !destination || !currentKey) return
    const ctrl = new AbortController()
    fetch(`/api/distance?from=${pickup.lat},${pickup.lng}&to=${destination.lat},${destination.lng}`, { signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status))
        const data = (await res.json()) as { distanceKm: number; durationMin: number }
        setRouteResult({ key: currentKey, distanceKm: data.distanceKm, durationMin: data.durationMin })
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setRouteResult({ key: currentKey, failed: true })
      })
    return () => ctrl.abort()
  }, [currentKey, pickup, destination])

  useEffect(() => () => clearTimeout(lookupTimer.current), [])

  const result = routeResult && routeResult.key === currentKey ? routeResult : null
  const route = result && !('failed' in result) ? result : null
  const routeFailed = !!result && 'failed' in result
  const calculating = !!currentKey && !result

  const estimate = useMemo(
    () =>
      calculateEstimate({
        distanceKm: route?.distanceKm ?? null,
        pickupSide: pickup ? sideOf(pickup.lat, pickup.lng) : 'mainland',
        destinationSide: destination ? sideOf(destination.lat, destination.lng) : 'mainland',
        tripType,
        accompaniment: needAccompaniment === 'yes',
        hours,
        pickupTime,
        returnTime,
      }),
    [route, pickup, destination, tripType, needAccompaniment, hours, pickupTime, returnTime],
  )

  const normalized = normalizeMobile(mobile)
  const lookupData = lookup && lookup.mobile === normalized && lookup.status === 'done' && lookup.data.ok && lookup.data.registered && !lookup.data.blocked ? lookup.data : null
  const usableVouchers = lookupData ? lookupData.vouchers.filter((v) => v.usable) : []
  const chosen = usableVouchers.filter((v) => selected.includes(v.id))
  const applied = estimate ? applyVouchers(estimate, chosen.map((v) => v.amount)) : null

  const { minHours, maxHours } = pricing.accompaniment

  function runLookup(canonical: string) {
    setLookup({ mobile: canonical, status: 'loading' })
    lookupCustomerFn({ data: { mobile: canonical } })
      .then((data) => {
        setLookup({ mobile: canonical, status: 'done', data })
        // Pre-select the most valuable usable voucher so customers don't miss their discount.
        if (data.ok && data.registered && !data.blocked) {
          const best = [...data.vouchers.filter((v) => v.usable)].sort((a, c) => c.amount - a.amount)
          setSelected(best.slice(0, rewards.maxVouchersPerBooking).map((v) => v.id))
        } else setSelected([])
      })
      .catch(() => setLookup({ mobile: canonical, status: 'failed' }))
  }

  function onMobileChange(value: string) {
    setMobile(value)
    clearTimeout(lookupTimer.current)
    const canonical = normalizeMobile(value)
    if (!canonical) {
      setLookup(null)
      setSelected([])
      return
    }
    if (lookup?.mobile === canonical) return
    lookupTimer.current = setTimeout(() => runLookup(canonical), 450)
  }

  function validate(): Errors {
    const e: Errors = {}
    if (!pickup) e.pickup = b.errors.pickup
    if (!destination) e.destination = b.errors.destination
    if (!travelDate || (minDate && travelDate < minDate)) e.date = rb.errors.date(business.minBookingDaysAhead)
    if (!pickupTime) e.pickupTime = rb.errors.time
    if (name.trim().length < 2) e.name = rb.errors.name
    if (!normalized) e.mobile = rb.errors.mobile
    return e
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (submitting) return
    setFormError('')
    const e = validate()
    setErrors(e)
    const first = (Object.keys(e) as FieldName[])[0]
    if (first || !pickup || !destination) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    if (calculating) return

    // Open the WhatsApp tab straight away (browsers block pop-ups opened after a delay).
    const win = window.open('', '_blank')
    setSubmitting(true)
    try {
      const res = await createBookingFn({
        data: {
          name: name.trim(),
          mobile,
          pickup: { name: pickup.name, address: pickup.address, lat: pickup.lat, lng: pickup.lng },
          destination: { name: destination.name, address: destination.address, lat: destination.lat, lng: destination.lng },
          travelDate,
          pickupTime,
          returnTime: tripType === 'round' && returnTime ? returnTime : undefined,
          tripType,
          accompanimentHours: needAccompaniment === 'yes' ? hours : 0,
          voucherIds: chosen.map((v) => v.id),
          language: lang,
        },
      })
      if (!res.ok) {
        win?.close()
        const map = {
          invalid_mobile: rb.errors.mobile,
          invalid_date: rb.errors.date(business.minBookingDaysAhead),
          invalid_location: rb.errors.location,
          voucher_unavailable: rb.errors.voucherUnavailable,
          too_many_vouchers: rb.errors.voucherUnavailable,
          server_error: rb.errors.server,
        } as const
        setFormError(map[res.error] ?? rb.errors.server)
        if (res.error === 'voucher_unavailable' && normalized) runLookup(normalized)
        return
      }
      const url = whatsappUrl(
        buildMessage(t, lang, { result: res, name, pickup, destination, travelDate, pickupTime, returnTime, tripType }),
      )
      if (win) win.location.href = url
      else window.location.href = url
      setSent(res)
      toast.info(rb.sentTitle, { description: rb.sentText, duration: 10000 })
      if (normalized) runLookup(normalized)
    } catch {
      win?.close()
      setFormError(rb.errors.server)
    } finally {
      setSubmitting(false)
    }
  }

  const err = (n: FieldName) => errors[n]
  const aria = (n: FieldName, hasHint = false) => ({
    'aria-invalid': err(n) ? true : undefined,
    'aria-describedby': err(n) ? `${fid(n)}-error` : hasHint ? `${fid(n)}-hint` : undefined,
  })

  return (
    <section id="booking" aria-labelledby="booking-title" className="bg-muted/50 py-16 sm:py-20">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <SectionHeading id="booking-title" title={b.title} intro={b.intro} className="mx-auto text-center" />

        <div role="note" className="mx-auto mb-6 flex max-w-5xl items-center gap-4 rounded-3xl border-2 border-warm bg-warm-soft p-5 sm:p-6">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-warm text-white">
            <CalendarClock className="size-8" aria-hidden="true" />
          </span>
          <p className="text-xl font-extrabold text-foreground sm:text-2xl">{b.notice}</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} noValidate className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="grid items-start gap-6 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8 lg:grid-cols-[1.25fr_1fr]">
            <div className="flex flex-col gap-6">
              <h3 className="font-display text-3xl font-bold">{b.estimateTitle}</h3>
              <div className="flex flex-col gap-5">
                <LocationSearch
                  id={fid('pickup')}
                  name="pickup"
                  label={b.pickupLocation}
                  placeholder={b.pickupPlaceholder}
                  value={pickup}
                  onChange={(p) => {
                    setPickup(p)
                    if (p) setErrors((e) => ({ ...e, pickup: undefined }))
                  }}
                  error={err('pickup')}
                  allowCurrentLocation
                />
                <LocationSearch
                  id={fid('destination')}
                  name="destination"
                  label={b.destinationLocation}
                  placeholder={b.destinationPlaceholder}
                  value={destination}
                  onChange={(p) => {
                    setDestination(p)
                    if (p) setErrors((e) => ({ ...e, destination: undefined }))
                  }}
                  error={err('destination')}
                />
              </div>

              <ChoiceGroup
                legend={b.tripType}
                name="tripType"
                value={tripType}
                onChange={setTripType}
                options={[
                  { value: 'oneway', label: b.oneWay },
                  { value: 'round', label: b.roundTrip },
                ]}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field id={fid('date')} label={d.date} hint={d.dateHint(business.minBookingDaysAhead)} error={err('date')}>
                    <input
                      id={fid('date')}
                      name="date"
                      type="date"
                      min={minDate || undefined}
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className={inputClass}
                      {...aria('date', true)}
                    />
                  </Field>
                </div>
                <Field id={fid('pickupTime')} label={d.pickupTime} error={err('pickupTime')}>
                  <input
                    id={fid('pickupTime')}
                    name="pickupTime"
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className={inputClass}
                    {...aria('pickupTime')}
                  />
                </Field>
                {tripType === 'round' && (
                  <Field id={fid('returnTime')} label={b.returnTime} hint={b.returnTimeHint}>
                    <input
                      id={fid('returnTime')}
                      name="returnTime"
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className={inputClass}
                      aria-describedby={`${fid('returnTime')}-hint`}
                    />
                  </Field>
                )}
              </div>

              <ChoiceGroup
                legend={b.needAccompaniment}
                name="accompaniment"
                value={needAccompaniment}
                onChange={setNeedAccompaniment}
                options={[
                  { value: 'yes', label: b.yes },
                  { value: 'no', label: b.no },
                ]}
              />

              {needAccompaniment === 'yes' && (
                <div className="flex flex-col gap-2">
                  <span id={fid('hours')} className="text-lg font-bold">
                    {b.hours}
                  </span>
                  <div role="group" aria-labelledby={fid('hours')} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setHours((h) => Math.max(minHours, h - 1))}
                      disabled={hours <= minHours}
                      aria-label={b.decreaseHours}
                      className="grid size-14 place-items-center rounded-xl border-2 border-input bg-card transition-colors hover:border-primary disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
                    >
                      <Minus className="size-6" aria-hidden="true" />
                    </button>
                    <output aria-live="polite" className="min-w-32 rounded-xl bg-secondary px-4 py-3 text-center text-2xl font-bold text-secondary-foreground">
                      {b.hoursUnit(hours)}
                    </output>
                    <button
                      type="button"
                      onClick={() => setHours((h) => Math.min(maxHours, h + 1))}
                      disabled={hours >= maxHours}
                      aria-label={b.increaseHours}
                      className="grid size-14 place-items-center rounded-xl border-2 border-input bg-card transition-colors hover:border-primary disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
                    >
                      <Plus className="size-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-5 border-t border-border pt-6">
                <h3 className="font-display text-2xl font-bold">{d.title}</h3>
                <Field id={fid('name')} label={d.name} error={err('name')}>
                  <input
                    id={fid('name')}
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    {...aria('name')}
                  />
                </Field>
                <Field id={fid('mobile')} label={d.mobile} hint={d.mobileHint} error={err('mobile')}>
                  <input
                    id={fid('mobile')}
                    name="mobile"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={mobile}
                    onChange={(e) => onMobileChange(e.target.value)}
                    className={inputClass}
                    {...aria('mobile', true)}
                  />
                </Field>
                <VoucherPicker state={lookup && lookup.mobile === normalized ? lookup : null} selected={selected} onChange={setSelected} />
              </div>
            </div>

            <EstimatePanel
              estimate={estimate}
              route={route}
              calculating={calculating}
              failed={routeFailed}
              balance={lookupData ? lookupData.balance : null}
              discount={applied?.discount ?? 0}
              payable={applied?.payable ?? null}
            />
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            {formError && (
              <p role="alert" className="flex max-w-reading items-center gap-2 rounded-2xl border-2 border-destructive/40 bg-destructive/10 p-4 text-left text-lg font-semibold text-destructive">
                <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
                {formError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-full bg-whatsapp px-6 py-3 text-xl font-bold text-white shadow-md transition-colors hover:bg-whatsapp-hover disabled:opacity-70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60 sm:w-auto sm:px-12"
            >
              {submitting ? <Loader2 className="size-6 animate-spin" aria-hidden="true" /> : <Send className="size-6" aria-hidden="true" />}
              {submitting ? rb.sending : rb.submit}
            </button>
            <p className="flex max-w-reading gap-2 text-left text-lg text-muted-foreground">
              <ShieldAlert className="mt-1 size-5 shrink-0 text-warm" aria-hidden="true" />
              {b.submitNote}
            </p>
            {sent && (
              <div role="status" className="w-full max-w-reading rounded-2xl border-2 border-primary/40 bg-secondary p-5 text-left text-lg text-secondary-foreground">
                <p className="font-bold">{rb.reference(sent.reference)}</p>
                <p className="mt-1">{rb.sentText}</p>
                {sent.vouchers.length > 0 && <p className="mt-2">{rb.voucherReservedNote}</p>}
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
