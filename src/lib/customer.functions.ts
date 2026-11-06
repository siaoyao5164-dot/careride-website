import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader, getRequestIP } from '@tanstack/react-start/server'
import { z } from 'zod'

const lang = z.enum(['en', 'ms', 'zh'])
const place = z.object({
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().max(300),
  lat: z.number().finite(),
  lng: z.number().finite(),
})
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)

export const registerCustomerFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().trim().min(2).max(100),
      mobile: z.string().trim().min(8).max(20),
      referrerMobile: z.string().trim().max(20).optional(),
      consent: z.literal(true),
      language: lang,
    }),
  )
  .handler(async ({ data }) => {
    const { registerCustomer, hashIp } = await import('@/server/rewards.server')
    const ip = getRequestHeader('x-nf-client-connection-ip') || getRequestIP({ xForwardedFor: true })
    return registerCustomer({ ...data, ipHash: hashIp(ip) })
  })

export const lookupCustomerFn = createServerFn({ method: 'POST' })
  .validator(z.object({ mobile: z.string().trim().min(8).max(20) }))
  .handler(async ({ data }) => {
    const { lookupCustomer } = await import('@/server/rewards.server')
    try {
      return await lookupCustomer(data.mobile)
    } catch (e) {
      console.error('Voucher lookup failed', e)
      return { ok: false as const, error: 'server_error' as const }
    }
  })

export const createBookingFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().trim().min(2).max(100),
      mobile: z.string().trim().min(8).max(20),
      pickup: place,
      destination: place,
      travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      pickupTime: time,
      returnTime: time.optional(),
      tripType: z.enum(['oneway', 'round']),
      accompanimentHours: z.number().int().min(0).max(24),
      voucherIds: z.array(z.number().int().positive()).max(10),
      language: lang,
    }),
  )
  .handler(async ({ data }) => {
    const { createBooking } = await import('@/server/rewards.server')
    return createBooking(data)
  })

export const getPublishedTestimonials = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { db, testimonials } = await import('../../db')
    const { asc, desc, eq } = await import('drizzle-orm')
    const rows = await db
      .select({
        id: testimonials.id,
        name: testimonials.name,
        detail: testimonials.detail,
        quote: testimonials.quote,
        rating: testimonials.rating,
      })
      .from(testimonials)
      .where(eq(testimonials.published, true))
      .orderBy(asc(testimonials.sortOrder), desc(testimonials.createdAt))
      .limit(6)
    return rows
  } catch (e) {
    console.error('Could not load testimonials', e)
    return []
  }
})
