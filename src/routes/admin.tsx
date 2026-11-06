import { createFileRoute, useRouter } from '@tanstack/react-router'
import {
  acceptInvite,
  AuthError,
  handleAuthCallback,
  login,
  logout,
  requestPasswordRecovery,
  updateUser,
} from '@netlify/identity'
import { Download, Loader2, LogOut, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import {
  deleteTestimonial,
  getAdminOverview,
  getAdminSession,
  issueManualVoucher,
  listBookings,
  listCustomers,
  listReferrals,
  listTestimonials,
  listVoucherHistory,
  listVouchers,
  saveTestimonial,
  setCustomerStatus,
  updateBookingStatus,
  updateVoucher,
} from '@/lib/admin.functions'
import { formatMobile } from '@/lib/phone'
import { formatRM } from '@/lib/pricing'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [{ title: 'CareRide admin' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  loader: () => getAdminSession(),
  component: AdminPage,
})

const input =
  'h-12 w-full rounded-lg border-2 border-input bg-card px-3 text-base focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40'
const btn =
  'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-base font-bold transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50'
const btnPrimary = cn(btn, 'bg-primary text-primary-foreground hover:bg-primary/90')
const btnOutline = cn(btn, 'border-2 border-border bg-card hover:bg-secondary')
const btnDanger = cn(btn, 'border-2 border-destructive/50 text-destructive hover:bg-destructive/10')

const dt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kuala_Lumpur' }) : '—'
const d = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-MY', { dateStyle: 'medium', timeZone: 'Asia/Kuala_Lumpur' }) : '—')
const money = (n: number | null) => (n === null ? '—' : formatRM(n))
const phone = (m: string | null) => (m ? formatMobile(m) : '—')
const isoDate = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() + 8 * 3_600_000).toISOString().slice(0, 10) : '')

function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : 'Something went wrong'
}

/* --------------------------------- Auth ---------------------------------- */

function AuthScreen() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'forgot' | 'set-password'>('login')
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    let active = true
    handleAuthCallback()
      .then(async (result) => {
        if (!active || !result) return
        if (result.type === 'invite' && result.token) {
          setToken(result.token)
          setMode('set-password')
        } else if (result.type === 'recovery') {
          setToken(null)
          setMode('set-password')
        } else {
          await router.invalidate()
        }
      })
      .catch((e) => active && setErr(errorMessage(e)))
    return () => {
      active = false
    }
  }, [router])

  async function submit(ev: React.FormEvent) {
    ev.preventDefault()
    setErr('')
    setMsg('')
    setPending(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        await router.invalidate()
      } else if (mode === 'forgot') {
        await requestPasswordRecovery(email)
        setMsg('If this email has an account, a password reset link is on its way.')
      } else {
        if (token) await acceptInvite(token, password)
        else await updateUser({ password })
        window.location.href = '/admin'
      }
    } catch (e) {
      setErr(e instanceof AuthError && e.status === 401 ? 'Wrong email or password.' : errorMessage(e))
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="grid min-h-svh place-items-center bg-muted/50 px-4">
      <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-4 rounded-3xl border border-border bg-card p-8 shadow-lg">
        <h1 className="font-display text-3xl font-bold">CareRide admin</h1>
        <p className="text-muted-foreground">
          {mode === 'set-password' ? 'Choose a password for your admin account.' : 'Only the CareRide administrator can sign in here.'}
        </p>
        {mode !== 'set-password' && (
          <label className="flex flex-col gap-1 font-semibold">
            Email
            <input className={input} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
        )}
        {mode !== 'forgot' && (
          <label className="flex flex-col gap-1 font-semibold">
            {mode === 'set-password' ? 'New password' : 'Password'}
            <input
              className={input}
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        )}
        {err && <p role="alert" className="font-semibold text-destructive">{err}</p>}
        {msg && <p role="status" className="font-semibold text-primary">{msg}</p>}
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
          {mode === 'login' ? 'Sign in' : mode === 'forgot' ? 'Send reset link' : 'Save password'}
        </button>
        {mode !== 'set-password' && (
          <button type="button" className="text-left font-semibold text-primary underline" onClick={() => setMode(mode === 'login' ? 'forgot' : 'login')}>
            {mode === 'login' ? 'Forgot password?' : 'Back to sign in'}
          </button>
        )}
      </form>
    </main>
  )
}

function AdminPage() {
  const session = Route.useLoaderData()
  const router = useRouter()
  if (!session.signedIn) return <AuthScreen />
  if (!session.isAdmin)
    return (
      <main className="grid min-h-svh place-items-center px-4">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold">No admin access</h1>
          <p className="mt-2 text-muted-foreground">{session.email} is signed in but does not have the admin role.</p>
          <button
            className={cn(btnOutline, 'mt-6')}
            onClick={async () => {
              await logout()
              await router.invalidate()
            }}
          >
            Sign out
          </button>
        </div>
      </main>
    )
  return <Dashboard email={session.email} />
}

/* ------------------------------- Dashboard -------------------------------- */

const tabs = ['Overview', 'Bookings', 'Customers', 'Vouchers', 'Referrals', 'History', 'Reviews'] as const
type Tab = (typeof tabs)[number]

function Dashboard({ email }: { email: string }) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('Overview')
  return (
    <div className="min-h-svh bg-muted/40">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <a href="/" className="font-display text-2xl font-bold text-primary">
            CareRide admin
          </a>
          <span className="ml-auto text-sm text-muted-foreground">{email}</span>
          <button
            className={btnOutline}
            onClick={async () => {
              await logout()
              await router.invalidate()
            }}
          >
            <LogOut className="size-4" aria-hidden="true" /> Sign out
          </button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2" aria-label="Admin sections">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-current={tab === t ? 'page' : undefined}
              className={cn('rounded-full px-4 py-2 font-semibold whitespace-nowrap', tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary')}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        {tab === 'Overview' && <Overview />}
        {tab === 'Bookings' && <Bookings />}
        {tab === 'Customers' && <Customers />}
        {tab === 'Vouchers' && <Vouchers />}
        {tab === 'Referrals' && <Referrals />}
        {tab === 'History' && <History />}
        {tab === 'Reviews' && <Reviews />}
      </main>
    </div>
  )
}

/** Loads data for a key; `reload()` fetches again. */
function useData<T>(key: string, load: () => Promise<T>) {
  const [state, setState] = useState<{ key: string; data?: T; error?: string } | null>(null)
  const [nonce, setNonce] = useState(0)
  const fullKey = `${key}#${nonce}`
  useEffect(() => {
    let active = true
    load()
      .then((data) => active && setState({ key: fullKey, data }))
      .catch((e) => active && setState({ key: fullKey, error: errorMessage(e) }))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullKey])
  const reload = useCallback(() => setNonce((n) => n + 1), [])
  const current = state?.key === fullKey ? state : null
  return { data: current?.data ?? (state?.data as T | undefined), loading: !current, error: current?.error, reload }
}

function Toolbar({ children, onReload, loading }: { children?: React.ReactNode; onReload: () => void; loading: boolean }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      {children}
      <button className={cn(btnOutline, 'ml-auto')} onClick={onReload}>
        <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden="true" /> Refresh
      </button>
    </div>
  )
}

function Search({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex min-w-64 flex-col gap-1 text-sm font-semibold">
      Search
      <input className={input} type="search" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

function StatusFilter({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      Status
      <select className={input} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

function ExportLink({ type }: { type: string }) {
  return (
    <a className={btnOutline} href={`/api/admin/export?type=${type}`}>
      <Download className="size-4" aria-hidden="true" /> Export CSV
    </a>
  )
}

function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty: boolean }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-3 font-bold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
      {empty && <p className="p-6 text-center text-muted-foreground">Nothing here yet.</p>}
    </div>
  )
}

function Badge({ value }: { value: string }) {
  const color: Record<string, string> = {
    available: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100',
    active: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100',
    rewarded: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100',
    completed: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100',
    reserved: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100',
    pending: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100',
    confirmed: 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100',
    redeemed: 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100',
    blocked: 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100',
    cancelled: 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100',
    rejected: 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100',
  }
  return <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap', color[value] ?? 'bg-muted text-muted-foreground')}>{value}</span>
}

function ErrorNote({ error }: { error?: string }) {
  return error ? <p role="alert" className="mb-4 rounded-xl bg-destructive/10 p-3 font-semibold text-destructive">{error}</p> : null
}

/* -------------------------------- Overview -------------------------------- */

function Overview() {
  const { data, loading, error, reload } = useData('overview', () => getAdminOverview())
  const cards = data
    ? [
        ['Registered customers', String(data.totalCustomers)],
        ['Blocked accounts', String(data.blocked)],
        ['Bookings waiting for you', String(data.pending)],
        ['Confirmed bookings', String(data.confirmed)],
        ['Available vouchers', `${data.available} (${formatRM(data.availableValue)})`],
        ['Reserved vouchers', String(data.reserved)],
        ['Redeemed vouchers', `${data.redeemed} (${formatRM(data.redeemedValue)})`],
        ['Referrals', String(data.referralCount)],
      ]
    : []
  return (
    <>
      <Toolbar onReload={reload} loading={loading} />
      <ErrorNote error={error} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-base">
        <h2 className="mb-2 text-lg font-bold">How bookings and vouchers work</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>When a customer taps “Book via WhatsApp”, a booking is created as <b>pending</b> and any voucher they chose is <b>reserved</b>.</li>
          <li>Check the WhatsApp message comes from the same mobile number as the booking, then press <b>Confirm</b>.</li>
          <li>After the trip, press <b>Complete</b>. Only then is the voucher <b>redeemed</b>.</li>
          <li>If the trip does not happen, press <b>Cancel</b> and the voucher goes back to the customer.</li>
        </ol>
      </div>
    </>
  )
}

/* -------------------------------- Bookings -------------------------------- */

function Bookings() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('pending')
  const [busy, setBusy] = useState<number | null>(null)
  const [actionError, setActionError] = useState('')
  const { data, loading, error, reload } = useData(`bookings:${search}:${status}`, () => listBookings({ data: { search, status } }))

  async function act(id: number, next: 'confirmed' | 'completed' | 'cancelled', reference: string) {
    const words = { confirmed: 'Confirm', completed: 'Mark as completed (redeems vouchers)', cancelled: 'Cancel (releases vouchers)' }
    if (!window.confirm(`${words[next]} booking ${reference}?`)) return
    setBusy(id)
    setActionError('')
    try {
      await updateBookingStatus({ data: { id, status: next } })
      reload()
    } catch (e) {
      setActionError(errorMessage(e))
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <Toolbar onReload={reload} loading={loading}>
        <Search value={search} onChange={setSearch} placeholder="Mobile number or reference" />
        <StatusFilter value={status} onChange={setStatus} options={['pending', 'confirmed', 'completed', 'cancelled']} />
        <ExportLink type="bookings" />
      </Toolbar>
      <ErrorNote error={error || actionError} />
      <Table
        head={['Reference', 'Created', 'Customer', 'Trip', 'Travel', 'Subtotal', 'Voucher', 'Final', 'Status', 'Actions']}
        empty={!loading && !data?.length}
      >
        {data?.map((b) => (
          <tr key={b.id} className="align-top">
            <td className="px-3 py-3 font-mono font-bold whitespace-nowrap">{b.reference}</td>
            <td className="px-3 py-3 whitespace-nowrap">{dt(b.createdAt)}</td>
            <td className="px-3 py-3">
              <div className="font-semibold">{b.name}</div>
              <div className="whitespace-nowrap">{phone(b.mobile)}</div>
              <div className="text-xs text-muted-foreground">{b.registered ? 'Registered' : 'Not registered'}</div>
            </td>
            <td className="max-w-72 px-3 py-3">
              <div>
                <b>From:</b> {b.pickup.name}
              </div>
              <div>
                <b>To:</b> {b.destination.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {b.tripType === 'round' ? 'Round trip' : 'One-way'}
                {b.distanceKm !== null && ` · ${b.distanceKm} km`}
                {b.accompanimentHours > 0 && ` · ${b.accompanimentHours} h accompaniment`}
              </div>
            </td>
            <td className="px-3 py-3 whitespace-nowrap">
              {b.travelDate} {b.pickupTime}
              {b.returnTime && <div className="text-xs text-muted-foreground">Return {b.returnTime}</div>}
            </td>
            <td className="px-3 py-3">{money(b.subtotal)}</td>
            <td className="px-3 py-3">
              {b.voucherCodes ? (
                <>
                  <div className="font-mono">{b.voucherCodes}</div>
                  <div className="text-xs">− {money(b.discount)}</div>
                </>
              ) : (
                '—'
              )}
            </td>
            <td className="px-3 py-3 font-bold">{money(b.total)}</td>
            <td className="px-3 py-3">
              <Badge value={b.status} />
              {b.adminNote && <div className="mt-1 text-xs text-muted-foreground">{b.adminNote}</div>}
            </td>
            <td className="px-3 py-3">
              <div className="flex flex-col gap-2">
                {b.status === 'pending' && (
                  <button className={btnOutline} disabled={busy === b.id} onClick={() => act(b.id, 'confirmed', b.reference)}>
                    Confirm
                  </button>
                )}
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <>
                    <button className={btnPrimary} disabled={busy === b.id} onClick={() => act(b.id, 'completed', b.reference)}>
                      Complete
                    </button>
                    <button className={btnDanger} disabled={busy === b.id} onClick={() => act(b.id, 'cancelled', b.reference)}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </>
  )
}

/* -------------------------------- Customers ------------------------------- */

function Customers() {
  const [search, setSearch] = useState('')
  const [actionError, setActionError] = useState('')
  const { data, loading, error, reload } = useData(`customers:${search}`, () => listCustomers({ data: { search } }))

  async function toggle(id: number, name: string, status: string) {
    const next = status === 'blocked' ? 'active' : 'blocked'
    const note =
      next === 'blocked'
        ? window.prompt(`Block ${name}? Their unused vouchers will be cancelled. Reason (optional):`, 'Duplicate or fraudulent account')
        : window.confirm(`Unblock ${name}?`)
          ? ''
          : null
    if (note === null) return
    setActionError('')
    try {
      await setCustomerStatus({ data: { id, status: next, note: note || undefined } })
      reload()
    } catch (e) {
      setActionError(errorMessage(e))
    }
  }

  return (
    <>
      <Toolbar onReload={reload} loading={loading}>
        <Search value={search} onChange={setSearch} placeholder="Mobile number or name" />
        <ExportLink type="customers" />
      </Toolbar>
      <ErrorNote error={error || actionError} />
      <Table
        head={['ID', 'Name', 'Mobile', 'Registered', 'Introduced by', 'First ride', 'Vouchers', 'Referrals', 'Bookings', 'Status', '']}
        empty={!loading && !data?.length}
      >
        {data?.map((c) => (
          <tr key={c.id} className="align-top">
            <td className="px-3 py-3 font-mono">{c.id}</td>
            <td className="px-3 py-3 font-semibold">{c.name}</td>
            <td className="px-3 py-3 whitespace-nowrap">{phone(c.mobile)}</td>
            <td className="px-3 py-3 whitespace-nowrap">{dt(c.registeredAt)}</td>
            <td className="px-3 py-3 whitespace-nowrap">{phone(c.referrerMobile)}</td>
            <td className="px-3 py-3">
              <Badge value={c.firstRideStatus} />
            </td>
            <td className="px-3 py-3">{formatRM(c.balance)}</td>
            <td className="px-3 py-3">{c.referralCount}</td>
            <td className="px-3 py-3">{c.bookingCount}</td>
            <td className="px-3 py-3">
              <Badge value={c.status} />
              {c.adminNote && <div className="mt-1 text-xs text-muted-foreground">{c.adminNote}</div>}
            </td>
            <td className="px-3 py-3">
              <button className={c.status === 'blocked' ? btnOutline : btnDanger} onClick={() => toggle(c.id, c.name, c.status)}>
                {c.status === 'blocked' ? 'Unblock' : 'Block'}
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </>
  )
}

/* -------------------------------- Vouchers -------------------------------- */

function IssueVoucher({ onDone }: { onDone: () => void }) {
  const [mobile, setMobile] = useState('')
  const [amount, setAmount] = useState('5')
  const [expiry, setExpiry] = useState('')
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setMsg('')
    try {
      const res = await issueManualVoucher({ data: { mobile, amount: Number(amount), expiresAt: expiry || null, note: note || undefined } })
      setMsg(`Voucher ${res.code} issued.`)
      setMobile('')
      setNote('')
      onDone()
    } catch (e) {
      setErr(errorMessage(e))
    }
  }
  return (
    <form onSubmit={submit} className="mb-6 rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-3 text-lg font-bold">Issue a voucher manually</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Customer mobile
          <input className={input} required value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="012-345 6789" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Amount (RM)
          <input className={input} required type="number" min="0.5" step="0.5" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Expiry date (optional)
          <input className={input} type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Note
          <input className={input} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Apology for delay" />
        </label>
        <div className="flex items-end">
          <button type="submit" className={cn(btnPrimary, 'w-full')}>
            Issue voucher
          </button>
        </div>
      </div>
      {msg && <p className="mt-3 font-semibold text-primary">{msg}</p>}
      {err && <p className="mt-3 font-semibold text-destructive">{err}</p>}
    </form>
  )
}

type VoucherRow = Awaited<ReturnType<typeof listVouchers>>[number]

function EditVoucher({ v, onClose }: { v: VoucherRow; onClose: (changed: boolean) => void }) {
  const [amount, setAmount] = useState(String(v.amount))
  const [expiry, setExpiry] = useState(isoDate(v.expiresAt))
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')
  async function save() {
    setErr('')
    try {
      await updateVoucher({
        data: {
          id: v.id,
          amount: Number(amount) !== v.amount ? Number(amount) : undefined,
          expiresAt: expiry !== isoDate(v.expiresAt) ? expiry || null : undefined,
          status: (status || undefined) as 'available' | 'cancelled' | 'expired' | undefined,
          note: note || undefined,
        },
      })
      onClose(true)
    } catch (e) {
      setErr(errorMessage(e))
    }
  }
  return (
    <tr className="bg-secondary/40">
      <td colSpan={9} className="px-3 py-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Amount (RM)
            <input className={input} type="number" min="0.5" step="0.5" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Expiry date (empty = none)
            <input className={input} type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Change status
            <select className={input} value={status} onChange={(e) => setStatus(e.target.value)} disabled={v.status === 'reserved'}>
              <option value="">Keep ({v.status})</option>
              <option value="available">available</option>
              <option value="expired">expired</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Reason
            <input className={input} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <div className="flex items-end gap-2">
            <button className={btnPrimary} onClick={save}>
              Save
            </button>
            <button className={btnOutline} onClick={() => onClose(false)}>
              Close
            </button>
          </div>
        </div>
        {err && <p className="mt-2 font-semibold text-destructive">{err}</p>}
      </td>
    </tr>
  )
}

function Vouchers() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const { data, loading, error, reload } = useData(`vouchers:${search}:${status}`, () => listVouchers({ data: { search, status } }))
  return (
    <>
      <IssueVoucher onDone={reload} />
      <Toolbar onReload={reload} loading={loading}>
        <Search value={search} onChange={setSearch} placeholder="Mobile number or voucher code" />
        <StatusFilter value={status} onChange={setStatus} options={['available', 'reserved', 'redeemed', 'expired', 'cancelled']} />
        <ExportLink type="vouchers" />
      </Toolbar>
      <ErrorNote error={error} />
      <Table head={['Code', 'Customer', 'Type', 'Amount', 'Issued', 'Expires', 'Status', 'Booking', '']} empty={!loading && !data?.length}>
        {data?.map((v) => (
          <VoucherRows key={v.id} v={v} editing={editing === v.id} onEdit={() => setEditing(v.id)} onClose={(changed) => {
            setEditing(null)
            if (changed) reload()
          }} />
        ))}
      </Table>
    </>
  )
}

function VoucherRows({ v, editing, onEdit, onClose }: { v: VoucherRow; editing: boolean; onEdit: () => void; onClose: (changed: boolean) => void }) {
  return (
    <>
      <tr className="align-top">
        <td className="px-3 py-3 font-mono font-bold">{v.code}</td>
        <td className="px-3 py-3">
          <div className="font-semibold">{v.customerName}</div>
          <div className="whitespace-nowrap">{phone(v.mobile)}</div>
        </td>
        <td className="px-3 py-3">
          {v.type === 'welcome' ? 'Welcome' : v.type === 'referral' ? 'Referral' : 'Manual'}
          {v.note && <div className="text-xs text-muted-foreground">{v.note}</div>}
        </td>
        <td className="px-3 py-3 font-bold">{formatRM(v.amount)}</td>
        <td className="px-3 py-3 whitespace-nowrap">{d(v.issuedAt)}</td>
        <td className="px-3 py-3 whitespace-nowrap">{v.expiresAt ? d(v.expiresAt) : 'No expiry'}</td>
        <td className="px-3 py-3">
          <Badge value={v.status} />
          {v.redeemedAt && <div className="mt-1 text-xs text-muted-foreground">{dt(v.redeemedAt)}</div>}
        </td>
        <td className="px-3 py-3 font-mono">{v.bookingReference ?? '—'}</td>
        <td className="px-3 py-3">
          {v.status !== 'redeemed' && (
            <button className={btnOutline} onClick={onEdit}>
              Edit
            </button>
          )}
        </td>
      </tr>
      {editing && <EditVoucher v={v} onClose={onClose} />}
    </>
  )
}

/* -------------------------------- Referrals ------------------------------- */

function Referrals() {
  const [search, setSearch] = useState('')
  const { data, loading, error, reload } = useData(`referrals:${search}`, () => listReferrals({ data: { search } }))
  return (
    <>
      <Toolbar onReload={reload} loading={loading}>
        <Search value={search} onChange={setSearch} placeholder="Mobile number" />
        <ExportLink type="referrals" />
      </Toolbar>
      <ErrorNote error={error} />
      <Table head={['Date', 'Referrer', 'New customer', 'Reward', 'Status', 'Reward voucher']} empty={!loading && !data?.length}>
        {data?.map((r) => (
          <tr key={r.id} className="align-top">
            <td className="px-3 py-3 whitespace-nowrap">{dt(r.createdAt)}</td>
            <td className="px-3 py-3">
              <div className="font-semibold">
                #{r.referrerId} {r.referrerName}
              </div>
              <div>{phone(r.referrerMobile)}</div>
            </td>
            <td className="px-3 py-3">
              <div className="font-semibold">
                #{r.referredId} {r.referredName}
              </div>
              <div>{phone(r.referredMobile)}</div>
            </td>
            <td className="px-3 py-3">{formatRM(r.reward)}</td>
            <td className="px-3 py-3">
              <Badge value={r.status} />
              {r.note && <div className="mt-1 text-xs text-muted-foreground">{r.note}</div>}
            </td>
            <td className="px-3 py-3">
              {r.voucherCode ? (
                <>
                  <span className="font-mono">{r.voucherCode}</span> {r.voucherStatus && <Badge value={r.voucherStatus} />}
                </>
              ) : (
                '—'
              )}
            </td>
          </tr>
        ))}
      </Table>
    </>
  )
}

/* --------------------------------- History -------------------------------- */

function History() {
  const [search, setSearch] = useState('')
  const { data, loading, error, reload } = useData(`history:${search}`, () => listVoucherHistory({ data: { search } }))
  return (
    <>
      <Toolbar onReload={reload} loading={loading}>
        <Search value={search} onChange={setSearch} placeholder="Mobile number or voucher code" />
      </Toolbar>
      <ErrorNote error={error} />
      <Table head={['When', 'Voucher', 'Customer', 'Event', 'Booking', 'By', 'Details']} empty={!loading && !data?.length}>
        {data?.map((e) => (
          <tr key={e.id} className="align-top">
            <td className="px-3 py-3 whitespace-nowrap">{dt(e.createdAt)}</td>
            <td className="px-3 py-3 font-mono">
              {e.code} ({formatRM(e.amount)})
            </td>
            <td className="px-3 py-3 whitespace-nowrap">{phone(e.mobile)}</td>
            <td className="px-3 py-3">
              <Badge value={e.event} />
            </td>
            <td className="px-3 py-3 font-mono">{e.bookingReference ?? '—'}</td>
            <td className="px-3 py-3">{e.actor}</td>
            <td className="px-3 py-3">{e.note ?? ''}</td>
          </tr>
        ))}
      </Table>
    </>
  )
}

/* --------------------------------- Reviews -------------------------------- */

type Review = Awaited<ReturnType<typeof listTestimonials>>[number]
const emptyReview = { name: '', detail: '', quote: '', rating: 5, published: true, sortOrder: 0 }

function Reviews() {
  const { data, loading, error, reload } = useData('reviews', () => listTestimonials())
  const [form, setForm] = useState<typeof emptyReview & { id?: number }>(emptyReview)
  const [err, setErr] = useState('')

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    try {
      await saveTestimonial({ data: { ...form, detail: form.detail || undefined } })
      setForm(emptyReview)
      reload()
    } catch (e) {
      setErr(errorMessage(e))
    }
  }
  async function remove(r: Review) {
    if (!window.confirm(`Delete the review from ${r.name}?`)) return
    await deleteTestimonial({ data: { id: r.id } })
    reload()
  }
  async function togglePublished(r: Review) {
    await saveTestimonial({
      data: { id: r.id, name: r.name, detail: r.detail ?? undefined, quote: r.quote, rating: r.rating, published: !r.published, sortOrder: r.sortOrder },
    })
    reload()
  }

  return (
    <>
      <form onSubmit={save} className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-bold">{form.id ? 'Edit review' : 'Add a customer review'}</h2>
        <p className="text-sm text-muted-foreground">
          Only publish real reviews from real customers, with their permission to show their name. Published reviews appear in the
          “What our customers say” section on the website (the section stays hidden until at least one is published).
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Customer name (as shown)
            <input className={input} required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mdm. Tan" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Detail (optional)
            <input className={input} maxLength={120} value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} placeholder="e.g. Bukit Mertajam · Hospital visit" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Stars
            <select className={input} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Order (lower shows first)
            <input className={input} type="number" min={0} max={999} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Review text
          <textarea className={cn(input, 'h-28 py-2')} required minLength={10} maxLength={600} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
        </label>
        <label className="flex items-center gap-2 font-semibold">
          <input type="checkbox" className="size-5" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Show on website
        </label>
        {err && <p className="font-semibold text-destructive">{err}</p>}
        <div className="flex gap-2">
          <button type="submit" className={btnPrimary}>
            {form.id ? 'Save changes' : 'Add review'}
          </button>
          {form.id && (
            <button type="button" className={btnOutline} onClick={() => setForm(emptyReview)}>
              Cancel edit
            </button>
          )}
        </div>
      </form>
      <Toolbar onReload={reload} loading={loading} />
      <ErrorNote error={error} />
      <Table head={['Order', 'Name', 'Review', 'Stars', 'Shown', '']} empty={!loading && !data?.length}>
        {data?.map((r) => (
          <tr key={r.id} className="align-top">
            <td className="px-3 py-3">{r.sortOrder}</td>
            <td className="px-3 py-3">
              <div className="font-semibold">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.detail}</div>
            </td>
            <td className="max-w-md px-3 py-3">{r.quote}</td>
            <td className="px-3 py-3">{r.rating}</td>
            <td className="px-3 py-3">
              <button className={btnOutline} onClick={() => togglePublished(r)}>
                {r.published ? 'Hide' : 'Show'}
              </button>
            </td>
            <td className="px-3 py-3">
              <div className="flex gap-2">
                <button
                  className={btnOutline}
                  onClick={() =>
                    setForm({ id: r.id, name: r.name, detail: r.detail ?? '', quote: r.quote, rating: r.rating, published: r.published, sortOrder: r.sortOrder })
                  }
                >
                  Edit
                </button>
                <button className={btnDanger} onClick={() => remove(r)}>
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </>
  )
}
