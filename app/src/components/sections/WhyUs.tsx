import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import SectionTag from '../ui/SectionTag'
import { fetchBenefits, fetchSectionTexts, type ApiBenefit, type SectionTextMap } from '../../lib/api'
import { pickLocale } from '../../i18n/localized'

function getIcon(name: string): LucideIcon {
  const iconMap = Icons as unknown as Record<string, LucideIcon>
  return iconMap[name] || iconMap['ShieldCheck']
}

function WhyCard({ benefit, index }: { benefit: ApiBenefit; index: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })
  const Icon = getIcon(benefit.icon)
  const { i18n } = useTranslation()
  const title = typeof benefit.title === 'string' ? pickLocale(JSON.parse(benefit.title), i18n.language) : pickLocale(benefit.title, i18n.language)
  const text = typeof benefit.text === 'string' ? pickLocale(JSON.parse(benefit.text), i18n.language) : pickLocale(benefit.text, i18n.language)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 70, damping: 18, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-3xl p-8 border border-brand/10 shadow-card hover:shadow-brand-lg transition-shadow duration-300 overflow-hidden cursor-default"
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-t-3xl" />
      <div className="w-14 h-14 bg-brand-light rounded-2xl flex items-center justify-center mb-6">
        <Icon className="w-7 h-7 text-brand" strokeWidth={2} />
      </div>
      <h3 className="text-[17px] font-bold text-ink mb-3 leading-snug">{title}</h3>
      <p className="text-[14px] text-ink-muted leading-[1.75]">{text}</p>
      <div className="absolute bottom-5 right-5 w-16 h-16 rounded-full bg-brand/4 group-hover:bg-brand/8 transition-colors duration-300" />
    </motion.div>
  )
}

export default function WhyUs() {
  const { t, i18n } = useTranslation()
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })
  const [benefits, setBenefits] = useState<ApiBenefit[]>([])
  const [texts, setTexts] = useState<SectionTextMap>({})

  useEffect(() => {
    fetchBenefits()
      .then(b => setBenefits(b.sort((a, b) => a.order - b.order)))
      .catch(() => { })
    fetchSectionTexts()
      .then(t => setTexts(t))
      .catch(() => { })
  }, [])

  return (
    <section id="why" className="py-24 bg-surface-sand">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="mb-14">
          <SectionTag>
            <Icons.ShieldCheck className="w-3 h-3" />
            {t('why.tag')}
          </SectionTag>
          <h2 className="font-heading text-[clamp(28px,3.2vw,46px)] text-ink leading-[1.12] mb-3">
            {texts['why.title']?.[i18n.language] || t('why.title1')} <em className="text-brand not-italic italic">{texts['why.title2']?.[i18n.language] || t('why.title2')}</em>
          </h2>
          <p className="text-[15.5px] text-ink-muted max-w-[500px] leading-[1.7]">{texts['why.sub']?.[i18n.language] || t('why.sub')}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <WhyCard key={b.id} benefit={b} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
