import { createFileRoute } from '@tanstack/react-router'

import { cacheHeaders, searchPlaces } from '@/lib/geo.server'

export const Route = createFileRoute('/api/places')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''
        if (q.length < 3 || q.length > 120) {
          return Response.json({ error: 'Type at least 3 characters' }, { status: 400 })
        }
        try {
          const places = await searchPlaces(q)
          return Response.json({ places }, { headers: cacheHeaders(86400) })
        } catch (error) {
          console.error('Place search failed', error)
          return Response.json({ error: 'Search is unavailable right now' }, { status: 502 })
        }
      },
    },
  },
})
