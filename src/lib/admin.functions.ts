import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

/** Who may open the admin dashboard: Identity users with the "admin" role, or listed in ADMIN_EMAILS. */
export async function getAdminUser() {
  const { getUser } = await import('@netlify/identity')
  const user = await getUser()
  if (!user) return null
  const allowList = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  const isAdmin = user.roles?.includes('admin') || (!!user.email && allowList.includes(user.email.toLowerCase()))
  return isAdmin ? { id: user.id, email: user.email ?? '' } : null
}

const requireAdmin = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const admin = await getAdminUser()
  if (!admin) throw new Error('Not authorised')
  return next({ context: { admin } })
})

/** Who is signed in (for the dashboard UI). */
export const getAdminSession = createServerFn({ method: 'GET' }).handler(async () => {
  const { getUser } = await import('@netlify/identity')
  const user = await getUser()
  if (!user) return { signedIn: false as const }
  const admin = await getAdminUser()
  return { signedIn: true as const, email: user.email ?? '', isAdmin: !!admin }
})

export const getAdminOverview = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .handler(async () => {
    const q = await import('@/server/admin-queries.server')
    return q.overview()
  })

export const listCustomers = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .validator(z.object({ search: z.string().max(40).default('') }))
  .handler(async ({ data }) => (await import('@/server/admin-queries.server')).listCustomers(data.search))

export const listVouchers = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .validator(z.object({ search: z.string().max(40).default(''), status: z.string().max(20).default('') }))
  .handler(async ({ data }) => (await import('@/server/admin-queries.server')).listVouchers(data.search, data.status))

export const listReferrals = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .validator(z.object({ search: z.string().max(40).default('') }))
  .handler(async ({ data }) => (await import('@/server/admin-queries.server')).listReferrals(data.search))

export const listBookings = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .validator(z.object({ search: z.string().max(40).default(''), status: z.string().max(20).default('') }))
  .handler(async ({ data }) => (await import('@/server/admin-queries.server')).listBookings(data.search, data.status))

export const listVoucherHistory = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .validator(z.object({ search: z.string().max(40).default('') }))
  .handler(async ({ data }) => (await import('@/server/admin-queries.server')).listVoucherHistory(data.search))

export const updateBookingStatus = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(z.object({ id: z.number().int().positive(), status: z.enum(['confirmed', 'completed', 'cancelled']) }))
  .handler(async ({ data, context }) => {
    const { setBookingStatus } = await import('@/server/rewards.server')
    await setBookingStatus(data.id, data.status, `admin:${context.admin.email}`)
    return { ok: true }
  })

export const issueManualVoucher = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(
    z.object({
      mobile: z.string().trim().min(8).max(20),
      amount: z.number().positive().max(1000),
      expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
      note: z.string().trim().max(200).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { adminIssueVoucher } = await import('@/server/rewards.server')
    const v = await adminIssueVoucher(data, `admin:${context.admin.email}`)
    return { ok: true, code: v.code }
  })

export const updateVoucher = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(
    z.object({
      id: z.number().int().positive(),
      amount: z.number().positive().max(1000).optional(),
      expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
      status: z.enum(['available', 'cancelled', 'expired']).optional(),
      note: z.string().trim().max(200).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { adminUpdateVoucher } = await import('@/server/rewards.server')
    await adminUpdateVoucher(data, `admin:${context.admin.email}`)
    return { ok: true }
  })

export const setCustomerStatus = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(
    z.object({ id: z.number().int().positive(), status: z.enum(['active', 'blocked']), note: z.string().trim().max(200).optional() }),
  )
  .handler(async ({ data, context }) => {
    const { adminSetCustomerStatus } = await import('@/server/rewards.server')
    await adminSetCustomerStatus(data.id, data.status, data.note, `admin:${context.admin.email}`)
    return { ok: true }
  })

const testimonialInput = z.object({
  name: z.string().trim().min(1).max(80),
  detail: z.string().trim().max(120).optional(),
  quote: z.string().trim().min(10).max(600),
  rating: z.number().int().min(1).max(5),
  published: z.boolean(),
  sortOrder: z.number().int().min(0).max(999),
})

export const listTestimonials = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .handler(async () => (await import('@/server/admin-queries.server')).listTestimonials())

export const saveTestimonial = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(testimonialInput.extend({ id: z.number().int().positive().optional() }))
  .handler(async ({ data }) => {
    await (await import('@/server/admin-queries.server')).saveTestimonial(data)
    return { ok: true }
  })

export const deleteTestimonial = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    await (await import('@/server/admin-queries.server')).deleteTestimonial(data.id)
    return { ok: true }
  })
