import { cn } from '@/lib/utils'
import { whatsappUrl } from '@/config/business'

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-6', className)} fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.2 4.24-9.43 9.45-9.43 2.52 0 4.9.99 6.68 2.77a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.24 9.44-9.45 9.44m8.04-17.48A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.68 12.06c0 2 .52 3.96 1.52 5.68L.58 23.65l6.04-1.58a11.33 11.33 0 0 0 5.43 1.38h.01c6.26 0 11.36-5.1 11.37-11.36 0-3.04-1.18-5.89-3.33-8.04" />
    </svg>
  )
}

type Size = 'md' | 'lg' | 'xl'

const sizes: Record<Size, string> = {
  md: 'h-12 px-5 text-base gap-2',
  lg: 'h-14 px-6 text-lg gap-2.5',
  xl: 'h-16 px-8 text-xl gap-3',
}

export function WhatsAppButton({
  children,
  size = 'lg',
  className,
  message,
  number,
}: {
  children: React.ReactNode
  size?: Size
  className?: string
  message?: string
  /** WhatsApp number (digits only); defaults to the main business number. */
  number?: string
}) {
  return (
    <a
      href={whatsappUrl(message, number)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-whatsapp font-bold text-white shadow-md shadow-whatsapp/20 transition-colors hover:bg-whatsapp-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60 motion-reduce:transition-none',
        sizes[size],
        className,
      )}
    >
      <WhatsAppIcon className={size === 'md' ? 'size-5' : 'size-6'} />
      {children}
    </a>
  )
}
