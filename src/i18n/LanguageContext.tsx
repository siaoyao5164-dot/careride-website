import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { languages, translations, type Lang, type Translation } from './translations'

const STORAGE_KEY = 'careride-lang'

interface LanguageContextValue {
  lang: Lang
  t: Translation
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function isLang(value: string | null): value is Lang {
  return value === 'en' || value === 'ms' || value === 'zh'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // English is the default for first-time visitors (and for the server render).
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (isLang(saved)) setLangState(saved)
    } catch {
      // Storage unavailable (private mode) — keep English.
    }
  }, [])

  useEffect(() => {
    const htmlLang = languages.find((l) => l.code === lang)?.htmlLang ?? 'en'
    document.documentElement.lang = htmlLang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
