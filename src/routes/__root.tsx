import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { NotFoundPage } from '@/components/error-pages'
import { business } from '@/config/business'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { themeInitScript } from '@/lib/theme'
import { faqJsonLd, localBusinessJsonLd } from '@/lib/structured-data'

import '../styles.css'

const { title, description, keywords, image } = business.seo
const imageUrl = `${business.siteUrl}${image}`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title },
      { name: 'description', content: description },
      { name: 'keywords', content: keywords.join(', ') },
      { name: 'robots', content: 'index, follow' },
      { name: 'theme-color', content: '#1f7a7a' },
      { name: 'geo.region', content: 'MY-07' },
      { name: 'geo.placename', content: 'Penang' },
      ...(business.googleSiteVerification
        ? [{ name: 'google-site-verification', content: business.googleSiteVerification }]
        : []),
      { property: 'og:site_name', content: business.name },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${business.siteUrl}/` },
      { property: 'og:image', content: imageUrl },
      { property: 'og:locale', content: 'en_MY' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
    ],
    links: [
      { rel: 'canonical', href: `${business.siteUrl}/` },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap',
      },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify(localBusinessJsonLd()) },
      { type: 'application/ld+json', children: JSON.stringify(faqJsonLd()) },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body>
        <LanguageProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </LanguageProvider>
        <Toaster position="top-center" richColors closeButton />
        <Scripts />
      </body>
    </html>
  )
}
