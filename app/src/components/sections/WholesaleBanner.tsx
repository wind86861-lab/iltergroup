import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { fetchCatalog, API_BASE } from '../../lib/api'

export default function WholesaleBanner() {
  const { t } = useTranslation()
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })
  const [catalogUrl, setCatalogUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchCatalog()
      .then(c => { if (c.exists && c.url) setCatalogUrl(`${API_BASE}${c.url}`) })
      .catch(() => { })
  }, [])

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8 max-w-7xl mx-auto">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ type: 'spring', stiffness: 60, damping: 20 }}
        className="relative overflow-hidden rounded-[32px] sm:rounded-[40px]"
        style={{ background: 'linear-gradient(145deg, #0026A8 0%, #004FF1 38%, #2E74FF 72%, #0A4BE0 100%)' }}
      >
        {/* Ambient glow orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-300/10 blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-teal-200/10 blur-[90px] pointer-events-none translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5 blur-[120px] pointer-events-none" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating glass card */}
        <div className="relative z-10 px-8 sm:px-16 lg:px-20 py-14 sm:py-20 lg:py-24">
          <div className="max-w-4xl mx-auto">
            {/* Top accent line */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-white/40" />
              <span className="text-[11px] sm:text-xs font-bold text-white/90 tracking-[0.2em] uppercase">
                {t('wholesale.tag')}
              </span>
              <div className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-white/40" />
            </div>

            {/* Headline */}
            <h2 className="font-heading text-center text-[clamp(22px,2.8vw,38px)] text-white leading-[1.15] mb-5">
              {t('wholesale.title')}
            </h2>

            {/* Subtext */}
            <p className="text-center text-[15px] sm:text-[17px] text-white/75 leading-[1.75] max-w-[560px] mx-auto mb-12 sm:mb-14">
              {t('wholesale.sub')}
            </p>

            {/* Buttons row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Primary — solid white */}
              <motion.a
                href="#catalog"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center justify-center gap-3 text-[14px] sm:text-[15px] font-bold text-brand bg-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl no-underline shadow-2xl shadow-emerald-900/20 overflow-hidden transition-all duration-300"
              >
                <span className="relative z-10">{t('wholesale.cta_primary')}</span>
                <ArrowRight className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.a>

              {/* Secondary — glass outline */}
              <motion.a
                href={catalogUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={catalogUrl ? { scale: 1.03, y: -2 } : {}}
                whileTap={catalogUrl ? { scale: 0.97 } : {}}
                className={`group relative inline-flex items-center justify-center gap-3 text-[14px] sm:text-[15px] font-bold text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl no-underline overflow-hidden border border-white/30 backdrop-blur-md transition-all duration-300 ${catalogUrl ? 'bg-white/10 hover:bg-white/20 hover:border-white/50 cursor-pointer' : 'bg-white/5 opacity-60 cursor-not-allowed'}`}
                onClick={e => { if (!catalogUrl) e.preventDefault() }}
              >
                <Download className="relative z-10 w-5 h-5" />
                <span className="relative z-10">{t('wholesale.cta_secondary')}</span>
              </motion.a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
