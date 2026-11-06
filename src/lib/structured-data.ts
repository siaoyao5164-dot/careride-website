import { business } from '@/config/business'
import { fromPrices } from '@/lib/pricing'
import { translations } from '@/i18n/translations'

const en = translations.en

/** LocalBusiness JSON-LD — only accurate, owner-provided business information. */
export function localBusinessJsonLd() {
  const url = business.siteUrl
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${url}/#business`,
    name: business.name,
    slogan: business.tagline,
    description: business.seo.description,
    url,
    image: `${url}${business.seo.image}`,
    telephone: `+${business.whatsappNumber}`,
    priceRange: `From RM${fromPrices.oneWay}`,
    currenciesAccepted: 'MYR',
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Penang',
      addressCountry: 'MY',
    },
    areaServed: Object.values(en.areas.names).map((name) => ({
      '@type': 'Place',
      name: `${name.replace(' (BM)', '')}, Penang`,
    })),
    sameAs: [`https://wa.me/${business.whatsappNumber}`],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'CareRide services',
      itemListElement: en.services.items.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, description: s.text },
      })),
    },
  }
}

export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: en.faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}
