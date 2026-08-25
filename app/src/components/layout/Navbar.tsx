import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import logo from '../../img/ilter-logo.png'

const LANGS = ['UZ', 'RU', 'EN', 'TR'] as const
type Lang = (typeof LANGS)[number]
const LANG_MAP: Record<Lang, string> = { UZ: 'uz', RU: 'ru', EN: 'en', TR: 'tr' }
const LANG_LABELS: Record<Lang, string> = { UZ: 'Oʻzbekcha', RU: 'Русский', EN: 'English', TR: 'Türkçe' }

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [activeLang, setActiveLang] = useState<Lang>(
    (localStorage.getItem('lang') || 'ru').toUpperCase() as Lang
  )
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    if (langOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [langOpen])

  const changeLang = (lang: Lang) => {
    setActiveLang(lang)
    i18n.changeLanguage(LANG_MAP[lang])
    localStorage.setItem('lang', LANG_MAP[lang])
    setLangOpen(false)
  }

  const navLinks = [
    { href: '#why', label: t('nav.about') },
    { href: '#catalog', label: t('nav.catalog') },
    { href: '#how', label: t('nav.how') },
    { href: '#contact', label: t('nav.contact') },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 22, delay: 0.1 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-brand-md' : ''}`}
        style={{
          background: 'rgba(247,249,254,0.90)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(0,79,241,0.13)',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#" className="flex items-center no-underline flex-shrink-0" aria-label="Ilter Group">
            <img src={logo} alt="Ilter Group" className="h-8 sm:h-9 w-auto" />
          </a>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex gap-6 lg:gap-8 list-none m-0 p-0">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[13.5px] font-medium text-ink-muted no-underline hover:text-brand transition-colors duration-200 tracking-wide"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {/* Language dropdown */}
            <div className="hidden sm:block relative" ref={langRef}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 text-[12px] font-bold tracking-wider px-3.5 py-[7px] rounded-xl border border-brand/15 bg-white text-ink cursor-pointer font-body transition-colors hover:border-brand/40 hover:text-brand"
              >
                <span className="w-5 h-5 rounded-full bg-brand-light text-brand flex items-center justify-center text-[10px]">
                  {activeLang}
                </span>
                <span>{LANG_LABELS[activeLang]}</span>
                <motion.span
                  animate={{ rotate: langOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl border border-brand/10 shadow-brand-lg overflow-hidden z-50"
                  >
                    {LANGS.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => changeLang(lang)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-[13px] font-medium border-none cursor-pointer transition-colors ${activeLang === lang
                          ? 'bg-brand-light text-brand'
                          : 'text-ink-muted hover:bg-surface hover:text-ink'
                          }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-brand-light text-brand flex items-center justify-center text-[10px] font-bold">
                            {lang}
                          </span>
                          {LANG_LABELS[lang]}
                        </span>
                        {activeLang === lang && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA */}
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.03, backgroundColor: '#0038B8' }}
              whileTap={{ scale: 0.97 }}
              className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-brand px-5 py-2.5 rounded-lg no-underline shadow-brand transition-colors"
            >
              {t('nav.cta')}
            </motion.a>

            {/* Hamburger */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-brand/15 text-ink-mid bg-transparent cursor-pointer"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-[68px] left-0 right-0 z-40 bg-surface/98 backdrop-blur-xl border-b border-brand/12 shadow-brand-lg px-5 pt-4 pb-6 md:hidden"
              style={{ backdropFilter: 'blur(20px)' }}
            >
              <ul className="list-none m-0 p-0 flex flex-col mb-5">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex py-3.5 text-[15px] font-medium text-ink-mid hover:text-brand border-b border-brand/8 no-underline transition-colors"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-semibold text-ink-muted tracking-wide uppercase">{t('nav.language') || 'Til / Язык'}</p>
                <div className="grid grid-cols-2 gap-2">
                  {LANGS.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => changeLang(lang)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border-none cursor-pointer text-[13px] font-medium transition-all ${activeLang === lang
                        ? 'bg-brand text-white shadow-brand'
                        : 'bg-white border border-brand/10 text-ink-muted hover:border-brand/30 hover:text-brand'
                        }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${activeLang === lang ? 'bg-white/20 text-white' : 'bg-brand-light text-brand'}`}>
                        {lang}
                      </span>
                      {LANG_LABELS[lang]}
                    </button>
                  ))}
                </div>
                <a
                  href="#contact"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 flex items-center justify-center text-[13px] font-semibold text-white bg-brand px-5 py-2.5 rounded-lg no-underline"
                >
                  {t('nav.cta')}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
