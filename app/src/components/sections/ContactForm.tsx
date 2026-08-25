import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Clock, Shield, Heart, Send, Phone, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import SectionTag from '../ui/SectionTag'
import { createMessage } from '../../lib/api'

interface FormData {
  name: string
  phone: string
  comment: string
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 12)
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `+${digits}`
  if (digits.length <= 5) return `+${digits.slice(0, 3)} (${digits.slice(3)}`
  if (digits.length <= 8) return `+${digits.slice(0, 3)} (${digits.slice(3, 5)}) ${digits.slice(5)}`
  if (digits.length <= 10) return `+${digits.slice(0, 3)} (${digits.slice(3, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`
  return `+${digits.slice(0, 3)} (${digits.slice(3, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10)}`
}

const perks = [
  { icon: Clock, titleKey: 'contact.perk1_title', textKey: 'contact.perk1_text' },
  { icon: Shield, titleKey: 'contact.perk2_title', textKey: 'contact.perk2_text' },
  { icon: Heart, titleKey: 'contact.perk3_title', textKey: 'contact.perk3_text' },
]

const CONFETTI_COLORS = ['#004FF1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#004FF1', '#F97316']

export default function ContactForm() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>()

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setValue('phone', formatted, { shouldValidate: true })
  }

  const handlePhoneFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value) setValue('phone', '+998 ', { shouldValidate: false })
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await createMessage({
        name: data.name,
        phone: data.phone,
        comment: data.comment || '',
      })
      setSubmitted(true)
      reset()
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-24 bg-surface">
      <div ref={ref} className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* ── Left: Info ── */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ type: 'spring', stiffness: 70, damping: 18 }}
          >
            <SectionTag>
              <Phone className="w-3 h-3" />
              {t('contact.tag')}
            </SectionTag>
            <h2 className="font-heading text-[clamp(28px,3.2vw,46px)] text-ink leading-[1.12] mb-4">
              {t('contact.title1')}{' '}
              <em className="text-brand not-italic italic">{t('contact.title2')}</em>
            </h2>
            <p className="text-[15.5px] text-ink-muted leading-[1.72] mb-10 max-w-[420px]">
              {t('contact.sub')}
            </p>

            {/* Perks */}
            <div className="flex flex-col gap-5">
              {perks.map((perk, i) => {
                const Icon = perk.icon
                return (
                  <motion.div
                    key={perk.titleKey}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 80, damping: 20 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-11 h-11 bg-brand-light rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-brand" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-ink mb-0.5">{t(perk.titleKey)}</p>
                      <p className="text-[13px] text-ink-muted">{t(perk.textKey)}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* ── Right: Form ── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ type: 'spring', stiffness: 70, damping: 18, delay: 0.1 }}
            className="bg-white rounded-3xl p-8 sm:p-10 border border-brand/10 shadow-brand relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="flex flex-col items-center text-center py-10 relative"
                >
                  {/* Confetti */}
                  {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 1, 0],
                        y: [0, -100 - Math.random() * 80],
                        x: [(Math.random() - 0.5) * 280],
                        scale: [0, 1.2, 0.8, 0],
                        rotate: [0, Math.random() * 540],
                      }}
                      transition={{ duration: 1.4, delay: 0.1 + i * 0.05, ease: 'easeOut' }}
                      className="absolute top-1/2 left-1/2 pointer-events-none"
                      style={{
                        width: 5 + Math.random() * 7,
                        height: 5 + Math.random() * 7,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                      }}
                    />
                  ))}

                  {/* Expanding rings */}
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={`ring-${i}`}
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: [0.3, 2.2], opacity: [0.5, 0] }}
                      transition={{ duration: 1, delay: 0.1 + i * 0.2, ease: 'easeOut' }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60px] w-20 h-20 rounded-full pointer-events-none"
                      style={{ border: '2px solid #10B981' }}
                    />
                  ))}

                  {/* Check circle */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.05 }}
                    className="relative w-24 h-24 rounded-full flex items-center justify-center mb-7"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.15, 1] }}
                      transition={{ duration: 0.4, delay: 0.35 }}
                      className="absolute inset-0 rounded-full"
                      style={{ boxShadow: '0 0 0 8px rgba(16,185,129,0.15)' }}
                    />
                    <motion.svg viewBox="0 0 24 24" className="w-12 h-12">
                      <motion.path
                        d="M5 13l4 4L19 7"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: 0.4, ease: 'easeInOut' }}
                      />
                    </motion.svg>
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.55 }}
                    className="font-heading text-[26px] text-slate-900 font-bold mb-2"
                  >
                    {t('order.success_title')}
                  </motion.h3>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="text-[14px] text-slate-500 mb-8 max-w-[300px] leading-relaxed"
                  >
                    {t('order.success_message')}
                  </motion.p>

                  {/* Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.85 }}
                    onClick={() => setSubmitted(false)}
                    className="px-10 py-3.5 text-white text-[14px] font-bold rounded-xl border-none cursor-pointer transition-all hover:scale-105 hover:shadow-lg flex items-center gap-2"
                    style={{ background: '#004FF1' }}
                  >
                    OK
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="inline-flex items-center gap-1.5 bg-brand-light text-brand-dark text-[11px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full mb-5">
                    {t('contact.form_tag')}
                  </div>
                  <h3 className="font-heading text-[26px] text-ink mb-1.5">{t('contact.form_title')}</h3>
                  <p className="text-[13.5px] text-ink-muted mb-7 leading-[1.65]">{t('contact.form_sub')}</p>

                  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                    {/* Name */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-semibold text-ink-mid tracking-wide">
                        {t('contact.name_label')} <span className="text-brand">*</span>
                      </label>
                      <input
                        {...register('name', { required: t('contact.name_required') })}
                        type="text"
                        autoComplete="name"
                        placeholder={t('contact.name_placeholder')}
                        className={`w-full font-body text-[15px] text-ink px-4 py-3.5 rounded-xl border bg-surface-sand outline-none transition-all duration-200 focus:border-brand focus:bg-white ${errors.name ? 'border-red-400' : 'border-ink/12'}`}
                      />
                      {errors.name && <span className="text-[12px] text-red-500">{errors.name.message}</span>}
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-semibold text-ink-mid tracking-wide">
                        {t('contact.phone_label')} <span className="text-brand">*</span>
                      </label>
                      <input
                        {...register('phone', {
                          required: t('contact.phone_required'),
                          validate: (v) => (v.replace(/\D/g, '').length >= 9) || t('order.phone_invalid'),
                          onChange: handlePhoneChange,
                        })}
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        onFocus={handlePhoneFocus}
                        placeholder="+998 (90) 123-45-67"
                        className={`w-full font-body text-[15px] text-ink px-4 py-3.5 rounded-xl border bg-surface-sand outline-none transition-all duration-200 focus:border-brand focus:bg-white tracking-wide ${errors.phone ? 'border-red-400' : 'border-ink/12'}`}
                      />
                      {errors.phone && <span className="text-[12px] text-red-500">{errors.phone.message}</span>}
                    </div>

                    {/* Comment */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-semibold text-ink-mid tracking-wide">
                        {t('contact.comment_label')}
                      </label>
                      <textarea
                        {...register('comment')}
                        placeholder={t('contact.comment_placeholder')}
                        rows={3}
                        className="w-full font-body text-[15px] text-ink px-4 py-3.5 rounded-xl border border-ink/12 bg-surface-sand outline-none transition-all duration-200 focus:border-brand focus:bg-white resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(0,79,241,0.28)' }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center justify-center gap-2.5 text-[15px] font-bold text-white py-4 rounded-xl border-none cursor-pointer mt-1 bg-brand hover:bg-brand-dark transition-colors duration-200 disabled:opacity-60"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" strokeWidth={2.2} />
                          {t('contact.submit')}
                        </>
                      )}
                    </motion.button>

                    <p className="text-[11.5px] text-ink-muted text-center leading-[1.5]">{t('contact.note')}</p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
