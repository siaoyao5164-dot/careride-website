import { createFileRoute } from '@tanstack/react-router'

import { cacheHeaders, parsePoint, roadDistance } from '@/lib/geo.server'
import { isInServiceArea } from '@/lib/pricing'

export const Route = createFileRoute('/api/distance')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams
        const from = parsePoint(params.get('from'))
        const to = parsePoint(params.get('to'))
        if (!from || !to || !isInServiceArea(from.lat, from.lng) || !isInServiceArea(to.lat, to.lng)) {
          return Response.json({ error: 'Invalid locations' }, { status: 400 })
        }
        try {
          const result = await roadDistance(from, to)
          return Response.json(result, { headers: cacheHeaders(604800) })
        } catch (error) {
          console.error('Distance lookup failed', error)
          return Response.json({ error: 'Distance is unavailable right now' }, { status: 502 })
        }
      },
    },
  },
})
