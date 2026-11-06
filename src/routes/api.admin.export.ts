import { createFileRoute } from '@tanstack/react-router'

import { getAdminUser } from '@/lib/admin.functions'

const types = ['customers', 'referrals', 'vouchers', 'bookings'] as const

export const Route = createFileRoute('/api/admin/export')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const headers = { 'Cache-Control': 'private, no-store' }
        const admin = await getAdminUser()
        if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401, headers })
        const type = new URL(request.url).searchParams.get('type') as (typeof types)[number]
        if (!types.includes(type)) return Response.json({ error: 'Unknown export' }, { status: 400, headers })
        const { exportCsv } = await import('@/server/admin-queries.server')
        const body = '﻿' + (await exportCsv(type))
        const date = new Date().toISOString().slice(0, 10)
        return new Response(body, {
          headers: {
            ...headers,
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="careride-${type}-${date}.csv"`,
          },
        })
      },
    },
  },
})
