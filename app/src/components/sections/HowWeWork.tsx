import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import SectionTag from '../ui/SectionTag'
import { fetchSteps, fetchSectionTexts, type ApiStep, type SectionTextMap } from '../../lib/api'
import { pickLocale } from '../../i18n/localized'

function getIcon(name: string): LucideIcon {
  const iconMap = Icons as unknown as Record<string, LucideIcon>
  return iconMap[name] || iconMap['ClipboardList']
}

export default function HowWeWork() {
  const { t, i18n } = useTranslation()
  const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true, threshold: 0.2 })
  const [steps, setSteps] = useState<ApiStep[]>([])
  const [texts, setTexts] = useState<SectionTextMap>({})

  useEffect(() => {
    fetchSteps()
      .then(s => setSteps(s.sort((a, b) => a.num - b.num)))
      .catch(() => { })
    fetchSectionTexts()
      .then(t => setTexts(t))
      .catch(() => { })
  }, [])

  return (
    <section id="how" className="py-24 bg-surface-sand">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-[520px] mx-auto mb-16"
        >
          <div className="flex justify-center">
            <SectionTag center>
              <Icons.ClipboardList className="w-3 h-3" />
              {t('how.tag')}
            </SectionTag>
          </div>
          <h2 className="font-heading text-[clamp(28px,3.2vw,46px)] text-ink leading-[1.12] mb-3">
            {texts['how.title']?.[i18n.language] || t('how.title1')} <em className="text-brand not-italic italic">{texts['how.title2']?.[i18n.language] || t('how.title2')}</em>
          </h2>
          <p className="text-[15.5px] text-ink-muted leading-[1.7]">{texts['how.sub']?.[i18n.language] || t('how.sub')}</p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-[44px] left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-px pointer-events-none">
            <motion.div
              className="h-full origin-left animate-flow-line"
              style={{
                background: 'repeating-linear-gradient(90deg, #004FF1 0, #004FF1 8px, transparent 8px, transparent 18px)',
                backgroundSize: '18px 100%',
              }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.4 }}
            />
          </div>

          {steps.map((step, i) => (
            <StepCard key={step.id} step={step} index={i} lang={i18n.language} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StepCard({ step, index, lang }: { step: ApiStep; index: number; lang: string }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })
  const Icon = getIcon(step.icon)
  const title = typeof step.title === 'string' ? pickLocale(JSON.parse(step.title), lang) : pickLocale(step.title, lang)
  const text = typeof step.text === 'string' ? pickLocale(JSON.parse(step.text), lang) : pickLocale(step.text, lang)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 70, damping: 18, delay: index * 0.12 }}
      className="flex flex-col items-center text-center relative z-10 group"
    >
      {/* Circle */}
      <div
        className="relative w-[88px] h-[88px] rounded-full bg-white border-2 border-brand/20 flex items-center justify-center mb-6 shadow-card transition-all duration-300 ease-out group-hover:bg-brand group-hover:scale-105 group-hover:shadow-brand-md"
      >
        {/* Dashed outer ring */}
        <div className="absolute inset-[-7px] rounded-full border border-dashed border-brand/25 transition-colors duration-300 group-hover:border-white/40" />
        {/* Step number badge */}
        <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {String(step.num).padStart(2, '0')}
        </span>
        <Icon className="w-8 h-8 text-brand group-hover:text-white transition-colors duration-300" strokeWidth={1.8} />
      </div>

      <h3 className="text-[15px] font-bold text-ink mb-2.5 leading-snug">{title}</h3>
      <p className="text-[13.5px] text-ink-muted leading-[1.65] max-w-[180px]">{text}</p>
    </motion.div>
  )
}
