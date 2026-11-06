import { createFileRoute } from '@tanstack/react-router'

import { parsePoint, reversePlace } from '@/lib/geo.server'
import { isInServiceArea } from '@/lib/pricing'

export const Route = createFileRoute('/api/reverse')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const point = parsePoint(new URL(request.url).searchParams.get('at'))
        if (!point) return Response.json({ error: 'Invalid location' }, { status: 400 })
        if (!isInServiceArea(point.lat, point.lng)) {
          return Response.json({ error: 'outside' }, { status: 422 })
        }
        try {
          const place = await reversePlace(point.lat, point.lng)
          return Response.json({ place })
        } catch (error) {
          console.error('Reverse lookup failed', error)
          return Response.json({ error: 'Location lookup is unavailable right now' }, { status: 502 })
        }
      },
    },
  },
})
