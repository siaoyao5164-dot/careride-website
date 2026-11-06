/**
 * CareRide business details.
 * Edit these values to update contact details, the website address and SEO
 * settings across the whole site.
 */
export const business = {
  name: 'CareRide',
  tagline: 'More Than a Ride, We Care.',
  location: 'Penang, Malaysia',
  /** WhatsApp number in international format, digits only (used for wa.me links). */
  whatsappNumber: '601136224566',
  /** Human-friendly phone number shown on the page. */
  phoneDisplay: '+60 11-3622 4566',
  /** The live website address, without a trailing slash. Update this when you add a custom domain. */
  siteUrl: 'https://careride-website.netlify.app',
  /** Minimum days in advance a customer should book. */
  minBookingDaysAhead: 3,
  /**
   * Google Search Console "HTML tag" verification code (only the content value).
   * Leave empty until Google gives you a code. See README.md for instructions.
   */
  googleSiteVerification: '',
  seo: {
    title: 'CareRide Penang | Private Car & Hospital Transport Service',
    description:
      'Need reliable private transport or hospital accompaniment in Penang? CareRide provides caring car transport services in Bukit Mertajam, Perai, Butterworth, Seberang Jaya and Penang Island. Contact us on WhatsApp.',
    keywords: [
      'Private car service Penang',
      'Hospital transport',
      'Hospital companion Penang',
      'Transport to hospital Penang',
      'driver Penang',
      'Bukit Mertajam transport',
      'Butterworth transport',
      'Seberang Jaya transport',
      'Perai transport',
      'Penang Island private transport',
      'Hospital appointment transport Penang',
    ],
    image: '/img/careride-service.jpg',
  },
} as const

export function whatsappUrl(message?: string, number: string = business.whatsappNumber) {
  const base = `https://wa.me/${number}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
