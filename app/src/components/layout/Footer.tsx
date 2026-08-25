import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin } from 'lucide-react'
import logoWhite from '../../img/ilter-logo-white.png'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { fetchSiteConfig, fetchFooterLinks, type SiteConfig, type FooterLink } from '../../lib/api'

import { SUPPORTED_LANGS, type Lang } from '../../i18n'

const FOOTER_LANG_LABEL: Record<Lang, string> = { uz: 'UZ', ru: 'RU', en: 'EN', tr: 'TR' }

export default function Footer() {
  const { t, i18n } = useTranslation()
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [links, setLinks] = useState<FooterLink[]>([])

  useEffect(() => {
    Promise.allSettled([fetchSiteConfig(), fetchFooterLinks()]).then(([c, l]) => {
      if (c.status === 'fulfilled') setConfig(c.value)
      if (l.status === 'fulfilled') setLinks(l.value.sort((a, b) => a.order - b.order))
    })
  }, [])

  const aboutLinks = links.filter(l => l.column === 'about')
  const productLinks = links.filter(l => l.column === 'products')
  const contactLinks = links.filter(l => l.column === 'contacts')

  const phone = config?.phone || '+998 90 799 73 44'
  const email = config?.email || 'info@iltergroup.uz'
  const address = config?.address || ''
  const tagline = config?.tagline || t('footer.tagline')
  const copyright = t('footer.copyright')
  const devBy = t('footer.dev_by')
  const devTeam = t('footer.dev_team')

  return (
    <footer className="bg-ink text-white/70">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12"
        >
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-5">
            <a href="#" className="flex items-center no-underline" aria-label="Ilter Group">
              <img src={logoWhite} alt="Ilter Group" className="h-8 w-auto" />
            </a>
            <p className="text-[13px] text-white/55 leading-[1.7] max-w-[240px]">
              {tagline}
            </p>
            <div className="flex flex-col gap-3">
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-2.5 text-[13px] text-white/55 hover:text-brand no-underline transition-colors">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                {phone}
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-2.5 text-[13px] text-white/55 hover:text-brand no-underline transition-colors">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                {email}
              </a>
              {address && (
                <span className="flex items-center gap-2.5 text-[13px] text-white/55">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                  {address}
                </span>
              )}
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="text-[13px] font-bold text-white mb-5 tracking-wide">{t('footer.col_about')}</h4>
            <ul className="list-none m-0 p-0 flex flex-col gap-3">
              {aboutLinks.length > 0 ? aboutLinks.map(link => (
                <li key={link.id}>
                  <a href={link.href} className="text-[13px] text-white/50 hover:text-brand no-underline transition-colors">{link.label}</a>
                </li>
              )) : (
                <li><span className="text-[13px] text-white/30">—</span></li>
              )}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-[13px] font-bold text-white mb-5 tracking-wide">{t('footer.col_products')}</h4>
            <ul className="list-none m-0 p-0 flex flex-col gap-3">
              {productLinks.length > 0 ? productLinks.map(link => (
                <li key={link.id}>
                  <a href={link.href} className="text-[13px] text-white/50 hover:text-brand no-underline transition-colors">{link.label}</a>
                </li>
              )) : (
                <li><span className="text-[13px] text-white/30">—</span></li>
              )}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-[13px] font-bold text-white mb-5 tracking-wide">{t('footer.col_contacts')}</h4>
            <ul className="list-none m-0 p-0 flex flex-col gap-3">
              {contactLinks.length > 0 ? contactLinks.map(link => (
                <li key={link.id}>
                  {link.href.startsWith('tel:') || link.href.startsWith('mailto:') ? (
                    <a href={link.href} className="text-[13px] text-white/50 hover:text-brand no-underline transition-colors">{link.label}</a>
                  ) : (
                    <span className="text-[13px] text-white/50">{link.label}</span>
                  )}
                </li>
              )) : (
                <>
                  <li><a href={`tel:${phone.replace(/\s/g, '')}`} className="text-[13px] text-white/50 hover:text-brand no-underline transition-colors">{phone}</a></li>
                  <li><a href={`mailto:${email}`} className="text-[13px] text-white/50 hover:text-brand no-underline transition-colors">{email}</a></li>
                  {address && <li><span className="text-[13px] text-white/50">{address}</span></li>}
                </>
              )}
            </ul>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-white/30 text-center sm:text-left">
            {copyright} ·{' '}
            <span className="text-white/25">{devBy}{' '}</span>
            {devTeam && (
              <a href="https://supersite.uz" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-brand no-underline transition-colors">{devTeam}</a>
            )}
          </p>
          <div className="flex items-center gap-1 bg-white/5 rounded-lg overflow-hidden">
            {SUPPORTED_LANGS.map((lang) => (
              <button
                key={lang}
                onClick={() => { i18n.changeLanguage(lang); localStorage.setItem('lang', lang) }}
                className={`text-[11px] font-bold tracking-wider px-2.5 py-1.5 border-none cursor-pointer transition-colors ${i18n.language === lang ? 'text-white bg-white/10' : 'text-white/35 hover:text-brand'}`}
              >
                {FOOTER_LANG_LABEL[lang]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
