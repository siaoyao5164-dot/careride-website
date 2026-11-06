import { AlertTriangle, Loader2, LocateFixed, MapPin, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useLanguage } from '@/i18n/LanguageContext'
import type { Place } from '@/lib/places'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'searching' | 'done' | 'failed'

/**
 * Address search with live suggestions (like ride-hailing apps).
 * The customer types, picks a suggestion, and the parent receives exact coordinates.
 */
export function LocationSearch({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  allowCurrentLocation = false,
}: {
  id: string
  name: string
  label: string
  placeholder: string
  value: Place | null
  onChange: (place: Place | null) => void
  error?: string
  allowCurrentLocation?: boolean
}) {
  const { t } = useLanguage()
  const b = t.booking
  const [query, setQuery] = useState(value?.name ?? '')
  const [results, setResults] = useState<Place[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const abort = useRef<AbortController>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = `${id}-list`

  useEffect(
    () => () => {
      clearTimeout(timer.current)
      abort.current?.abort()
    },
    [],
  )

  function search(text: string) {
    clearTimeout(timer.current)
    abort.current?.abort()
    if (text.trim().length < 3) {
      setResults([])
      setStatus('idle')
      return
    }
    setStatus('searching')
    timer.current = setTimeout(async () => {
      const ctrl = new AbortController()
      abort.current = ctrl
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(text.trim())}`, { signal: ctrl.signal })
        if (!res.ok) throw new Error(String(res.status))
        const data = (await res.json()) as { places: Place[] }
        setResults(data.places)
        setActive(data.places.length ? 0 : -1)
        setStatus('done')
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setStatus('failed')
      }
    }, 350)
  }

  function choose(place: Place) {
    onChange(place)
    setQuery(place.name)
    setOpen(false)
    setResults([])
    setStatus('idle')
    setLocateError('')
  }

  function clear() {
    onChange(null)
    setQuery('')
    setResults([])
    setStatus('idle')
    inputRef.current?.focus()
  }

  function useCurrentLocation() {
    if (!('geolocation' in navigator)) {
      setLocateError(b.locationFailed)
      return
    }
    setLocating(true)
    setLocateError('')
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`/api/reverse?at=${coords.latitude},${coords.longitude}`)
          if (res.status === 422) throw new Error('outside')
          if (!res.ok) throw new Error('failed')
          const data = (await res.json()) as { place: Place | null }
          choose(
            data.place ?? {
              id: `gps-${coords.latitude},${coords.longitude}`,
              name: b.useMyLocation,
              address: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
              lat: coords.latitude,
              lng: coords.longitude,
            },
          )
        } catch (e) {
          setLocateError((e as Error).message === 'outside' ? b.locationOutside : b.locationFailed)
        } finally {
          setLocating(false)
        }
      },
      (err) => {
        setLocating(false)
        setLocateError(err.code === err.PERMISSION_DENIED ? b.locationDenied : b.locationFailed)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    )
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      choose(results[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showList = open && query.trim().length >= 3 && !value
  const message = error || locateError
  const describedBy = message ? `${id}-error` : value ? undefined : `${id}-hint`

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-lg font-bold">
        {label}
      </label>
      <div className="relative">
        <MapPin
          aria-hidden="true"
          className={cn('pointer-events-none absolute top-1/2 left-4 size-6 -translate-y-1/2', value ? 'text-primary' : 'text-muted-foreground')}
        />
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          autoComplete="off"
          enterKeyHint="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (value) onChange(null)
            setOpen(true)
            search(e.target.value)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className={cn(
            'block h-14 w-full rounded-xl border-2 border-input bg-card pr-14 pl-12 text-lg text-foreground shadow-xs transition-colors placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 aria-[invalid=true]:border-destructive',
            value && 'border-primary/60 font-semibold',
          )}
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            aria-label={`${b.clearLocation}: ${label}`}
            className="absolute top-0 right-0 grid size-14 place-items-center rounded-xl text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        )}

        {showList && (
          <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border-2 border-border bg-popover text-popover-foreground shadow-xl">
            {status === 'searching' && (
              <p className="flex items-center gap-2 px-4 py-4 text-lg text-muted-foreground" role="status">
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                {b.searching}
              </p>
            )}
            {status === 'failed' && <p className="px-4 py-4 text-lg text-destructive" role="status">{b.searchFailed}</p>}
            {status === 'done' && results.length === 0 && (
              <p className="px-4 py-4 text-lg text-muted-foreground" role="status">{b.noResults}</p>
            )}
            <ul id={listId} role="listbox" aria-label={label} className="max-h-80 overflow-y-auto">
              {status === 'done' &&
                results.map((p, i) => (
                  <li
                    key={p.id}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(p)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      'flex min-h-14 cursor-pointer items-start gap-3 border-b border-border px-4 py-3 last:border-b-0',
                      i === active && 'bg-secondary text-secondary-foreground',
                    )}
                  >
                    <MapPin className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      <span className="block text-lg font-bold">{p.name}</span>
                      {p.address && <span className="block text-base text-muted-foreground">{p.address}</span>}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>

      {value?.address && <p className="pl-1 text-base text-muted-foreground">{value.address}</p>}

      {allowCurrentLocation && !value && (
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="inline-flex min-h-14 w-fit items-center gap-2 rounded-full px-2 text-lg font-bold text-primary underline-offset-4 hover:underline disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
        >
          {locating ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <LocateFixed className="size-5" aria-hidden="true" />}
          {locating ? b.locating : b.useMyLocation}
        </button>
      )}

      {message ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-base font-semibold text-destructive">
          <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
          {message}
        </p>
      ) : (
        !value && (
          <p id={`${id}-hint`} className="text-base text-muted-foreground">
            {b.searchHint}
          </p>
        )
      )}
    </div>
  )
}
