import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { fetchPartners, fetchSectionTexts, type ApiPartner, type SectionTextMap, API_BASE } from '../../lib/api'
import SectionTag from '../ui/SectionTag'

function partnerImage(src: string) {
  if (!src) return ''
  if (src.startsWith('http') || src.startsWith('data:')) return src
  return `${API_BASE}${src}`
}

export default function Partners() {
  const { t, i18n } = useTranslation()
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })
  const [partners, setPartners] = useState<ApiPartner[]>([])
  const [texts, setTexts] = useState<SectionTextMap>({})

  useEffect(() => {
    fetchPartners()
      .then(p => setPartners(p.sort((a, b) => a.order - b.order)))
      .catch(() => { })
    fetchSectionTexts()
      .then(t => setTexts(t))
      .catch(() => { })
  }, [])

  const doubled = [...partners, ...partners]

  return (
    <section className="py-24 bg-surface-sand overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="flex justify-center">
            <SectionTag center>{t('partners.tag')}</SectionTag>
          </div>
          <h2 className="font-heading text-[clamp(28px,3.2vw,46px)] text-ink leading-[1.12] mb-3">
            {texts['partners.title']?.[i18n.language] || t('partners.title')}
          </h2>
          <p className="text-[15.5px] text-ink-muted max-w-[480px] mx-auto leading-[1.7]">
            {texts['partners.sub']?.[i18n.language] || t('partners.sub')}
          </p>
        </motion.div>
      </div>

      {/* Infinite marquee */}
      <div className="relative">
        {/* Fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, #F1F3F9 0%, transparent 100%)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(270deg, #F1F3F9 0%, transparent 100%)' }} />

        <div className="flex animate-marquee gap-4 w-max">
          {doubled.map((partner, i) => (
            <motion.div
              key={`${partner.id}-${i}`}
              whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,79,241,0.14)' }}
              className="flex items-center gap-3 bg-white border border-brand/10 rounded-2xl px-5 py-4 min-w-[160px] flex-shrink-0 cursor-default shadow-card"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ backgroundColor: partner.color }}
              >
                {partner.image ? (
                  <img src={partnerImage(partner.image)} alt={partner.name} className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-white text-[14px] font-bold">{partner.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-ink leading-tight">{partner.name}</div>
                <div className="text-[11px] text-ink-muted">{partner.type}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
