import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Star, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import AnimatedCounter from '../ui/AnimatedCounter'
import { fetchTopProducts, fetchProducts, type Product } from '../../lib/api'
import { productImage } from '../../lib/images'
import { pickLocale } from '../../i18n/localized'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } },
}
const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 75, damping: 18 } },
}

export default function Hero() {
  const { t, i18n } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let alive = true
    fetchTopProducts()
      .then(list => {
        if (alive) {
          if (list.length > 0) {
            setProducts(list.slice(0, 5))
          } else {
            fetchProducts().then(all => { if (alive) setProducts(all.slice(0, 5)) })
          }
        }
      })
      .catch(() => { /* ignore — section just won't show product image */ })
    return () => { alive = false }
  }, [])

  const nextSlide = useCallback(() => {
    setProducts(prev => {
      setIndex(i => (prev.length > 0 ? (i + 1) % prev.length : 0))
      return prev
    })
  }, [])

  useEffect(() => {
    if (products.length < 2) return
    const timer = setInterval(nextSlide, 4000)
    return () => clearInterval(timer)
  }, [products.length, nextSlide])

  const current = products[index]

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-8 overflow-hidden bg-surface">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-60"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,79,241,0.10) 0%, transparent 68%)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-50"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,79,241,0.08) 0%, transparent 70%)' }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,79,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,79,241,1) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-20 items-center">

          {/* ── Left column ── */}
          <motion.div variants={container} initial="hidden" animate="visible">
            {/* Badge */}
            <motion.div variants={item} className="inline-flex items-center gap-2 bg-brand-light border border-brand/22 rounded-full px-4 py-1.5 mb-6 sm:mb-8">
              <span className="w-2 h-2 bg-brand rounded-full animate-blink flex-shrink-0" />
              <span className="text-[12.5px] text-brand-dark font-semibold tracking-wide">{t('hero.badge')}</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={item} className="font-heading text-[clamp(36px,4.8vw,62px)] leading-[1.08] text-ink mb-5 tracking-tight">
              {t('hero.title1')}{' '}
              <em className="text-brand not-italic italic">{t('hero.title2')}</em>
              <br />
              {t('hero.title3')}
            </motion.h1>

            {/* Sub */}
            <motion.p variants={item} className="text-[15.5px] text-ink-muted leading-[1.75] max-w-[460px] mb-8 font-light">
              {t('hero.sub')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={item} className="flex flex-wrap gap-3 mb-12">
              <motion.a
                href="#contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-brand px-6 py-3 rounded-xl no-underline shadow-brand"
                whileHover={{ backgroundColor: '#0038B8', y: -2, boxShadow: '0 10px 30px rgba(0,79,241,0.28)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18 }}
              >
                {t('hero.cta_primary')}
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </motion.a>
              <motion.a
                href="#catalog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink border border-ink/16 px-6 py-3 rounded-xl no-underline bg-white"
                whileHover={{ borderColor: '#004FF1', color: '#004FF1', y: -2, backgroundColor: '#F7F9FE' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18 }}
              >
                {t('hero.cta_secondary')}
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div variants={item} className="flex items-stretch gap-6 sm:gap-10 flex-wrap">
              <div className="flex flex-col gap-1">
                <div className="text-[26px] font-bold text-ink leading-none tracking-tight">
                  <AnimatedCounter to={500} suffix="+" />
                </div>
                <div className="text-[12px] text-ink-muted font-medium tracking-wide uppercase">{t('hero.stat1_label')}</div>
              </div>
              <div className="w-px bg-brand/20 self-stretch" />
              <div className="flex flex-col gap-1">
                <div className="text-[26px] font-bold text-ink leading-none tracking-tight">
                  <AnimatedCounter to={10000} suffix="+" separator />
                </div>
                <div className="text-[12px] text-ink-muted font-medium tracking-wide uppercase">{t('hero.stat2_label')}</div>
              </div>
              <div className="w-px bg-brand/20 self-stretch" />
              <div className="flex flex-col gap-1">
                <div className="text-[26px] font-bold text-ink leading-none tracking-tight">
                  4.9<span className="text-brand">★</span>
                </div>
                <div className="text-[12px] text-ink-muted font-medium tracking-wide uppercase">{t('hero.stat3_label')}</div>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right column ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 60, damping: 22, delay: 0.35 }}
            className="relative hidden lg:block"
          >
            {/* Main card container */}
            <div className="relative rounded-[32px] overflow-hidden border border-brand/14 shadow-brand-lg bg-white"
              style={{ aspectRatio: '4/4.6' }}
            >
              {/* Soft gradient background behind image */}
              <div className="absolute inset-0 bg-gradient-to-b from-brand-light/60 via-surface to-white" />

              {/* Spinning decorative rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-56 h-56 rounded-full border-2 border-dashed border-brand/15"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-80 h-80 rounded-full border border-dashed border-brand/10"
                />
              </div>

              {/* Product image slider */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="relative" style={{ willChange: 'transform' }}>
                  <AnimatePresence mode="wait">
                    {current && (
                      <motion.div
                        key={current.id}
                        initial={{ opacity: 0, scale: 0.92, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.45, ease: 'easeInOut' }}
                        className="relative animate-float"
                      >
                        <img
                          src={productImage(current)}
                          alt={pickLocale(current.name, i18n.language)}
                          className="w-full h-auto max-h-[380px] object-contain"
                          loading="eager"
                          style={{ willChange: 'transform' }}
                        />
                        {/* Floating badges */}
                        <div
                          className="absolute -top-1 -right-5 bg-white rounded-xl px-3 py-1.5 shadow-card flex items-center gap-1.5 z-10"
                          style={{ animation: 'float 2.8s ease-in-out infinite', willChange: 'transform' }}
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-brand" />
                          <span className="text-[11px] font-bold text-ink">Top 2026</span>
                        </div>
                        <div
                          className="absolute -bottom-1 -left-5 bg-white rounded-xl px-3 py-1.5 shadow-card flex items-center gap-1.5 z-10"
                          style={{ animation: 'float 3.2s ease-in-out infinite 0.5s', willChange: 'transform' }}
                        >
                          <span className="text-[10px] font-bold text-brand">★★★★★</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Floating bottom card — shows current product name */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-white/80 shadow-card-hover flex items-center justify-between z-10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-brand" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink leading-tight truncate">{current ? pickLocale(current.name, i18n.language) : t('hero.float_title')}</p>
                    <p className="text-[11.5px] text-ink-muted">{current ? pickLocale(current.label, i18n.language) : t('hero.float_sub')}</p>
                  </div>
                </div>
                <span className="bg-brand-light text-brand-dark text-[11px] font-bold px-3 py-1 rounded-full border border-brand/20 flex-shrink-0 ml-2">
                  {t('hero.float_badge')}
                </span>
              </motion.div>
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-2xl bg-brand/8 -z-10" />
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-xl bg-brand/6 -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
