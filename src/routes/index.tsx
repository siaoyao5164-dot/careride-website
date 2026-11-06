import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import { Booking } from '@/components/site/booking'
import { Contact, Faq, Footer, MobileWhatsAppBar } from '@/components/site/closing'
import { Header } from '@/components/site/header'
import { Hero } from '@/components/site/hero'
import { Register } from '@/components/site/register'
import { Services } from '@/components/site/sections'
import { Testimonials } from '@/components/site/testimonials'
import { useLanguage } from '@/i18n/LanguageContext'
import { getPublishedTestimonials } from '@/lib/customer.functions'

export const Route = createFileRoute('/')({
  loader: () => getPublishedTestimonials(),
  component: Home,
})

function Home() {
  const { t } = useLanguage()
  const testimonials = Route.useLoaderData()

  // Admin invite / password-reset emails link to the home page; send them on to the admin sign-in.
  useEffect(() => {
    if (/(invite|recovery|confirmation|email_change)_token=/.test(window.location.hash)) {
      window.location.replace(`/admin${window.location.hash}`)
    }
  }, [])
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-primary-foreground"
      >
        {t.skipToContent}
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Services />
        <Booking />
        <Register />
        <Testimonials items={testimonials} />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <MobileWhatsAppBar />
    </>
  )
}
