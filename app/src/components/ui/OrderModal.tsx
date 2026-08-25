import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, User, Phone, MessageSquare, ArrowRight, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createOrder } from '../../lib/api'

interface OrderModalProps {
  productName: string | null
  onClose: () => void
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

export default function OrderModal({ productName, onClose }: OrderModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (productName !== null) {
      setName('')
      setPhone('')
      setComment('')
      setSubmitted(false)
      setLoading(false)
      setErrors({})
      setTimeout(() => nameRef.current?.focus(), 300)
    }
  }, [productName])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = t('order.name_error')
    const digits = phone.replace(/\D/g, '')
    if (!digits) errs.phone = t('order.phone_error')
    else if (digits.length < 9) errs.phone = t('order.phone_invalid')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // Allow only digits, +, spaces, parens, dashes
    const cleaned = raw.replace(/[^\d+\s()\-]/g, '')
    const digits = cleaned.replace(/\D/g, '')
    if (digits.length === 0 && raw.length > 0) {
      setPhone('')
      return
    }
    setPhone(formatPhone(raw))
    if (errors.phone) setErrors({ ...errors, phone: '' })
  }

  const handlePhoneFocus = () => {
    if (!phone) setPhone('+998 ')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      await createOrder({
        customer: name.trim(),
        phone: phone.trim(),
        items: [{ productId: 0, name: productName || '—', qty: 1, price: 0 }],
        total: 0,
        notes: comment.trim() || '',
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to send order:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {productName !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
          style={{ backgroundColor: 'rgba(14,18,32,0.6)', backdropFilter: 'blur(10px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[24px] overflow-hidden w-full max-w-[480px] relative"
            style={{ boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)' }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" strokeWidth={2.5} />
            </button>

            {submitted ? (
              <div className="px-8 py-14 flex flex-col items-center text-center relative overflow-hidden">
                {/* Confetti particles */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      y: [0, -80 - Math.random() * 60],
                      x: [(Math.random() - 0.5) * 200],
                      scale: [0, 1, 0.8, 0],
                      rotate: [0, Math.random() * 360],
                    }}
                    transition={{ duration: 1.2, delay: 0.2 + i * 0.06, ease: 'easeOut' }}
                    className="absolute top-1/2 left-1/2 pointer-events-none"
                    style={{
                      width: 6 + Math.random() * 6,
                      height: 6 + Math.random() * 6,
                      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                      background: ['#004FF1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][i % 6],
                    }}
                  />
                ))}

                {/* Pulse ring */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 1.8], opacity: [0.4, 0] }}
                  transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[85px] w-24 h-24 rounded-full pointer-events-none"
                  style={{ border: '3px solid #10B981' }}
                />

                {/* Check icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="relative w-20 h-20 rounded-full flex items-center justify-center mb-6"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                >
                  <motion.svg
                    viewBox="0 0 24 24"
                    className="w-10 h-10"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.4, ease: 'easeInOut' }}
                    />
                  </motion.svg>
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="font-heading text-[24px] text-slate-900 font-bold mb-2"
                >
                  {t('order.success_title')}
                </motion.h3>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.65 }}
                  className="text-[14px] text-slate-500 mb-8 max-w-[300px] leading-relaxed"
                >
                  {t('order.success_message')}
                </motion.p>

                {/* Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  onClick={onClose}
                  className="px-12 py-3.5 text-white text-[14px] font-bold rounded-xl border-none cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                  style={{ background: '#004FF1' }}
                >
                  OK
                </motion.button>
              </div>
            ) : (
              <div className="p-7 sm:p-8">
                {/* Header */}
                <div className="mb-7">
                  <h3 className="font-heading text-[22px] text-slate-900 font-bold mb-1">{t('order.title')}</h3>
                  <p className="text-[13px] text-slate-400">{t('order.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Product name (read-only) */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <Package className="w-3.5 h-3.5" />
                      {t('order.product_label')}
                    </label>
                    <div className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[14px] text-slate-600 font-medium">
                      {productName || ''}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <User className="w-3.5 h-3.5" />
                      {t('order.name_label')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      ref={nameRef}
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({ ...errors, name: '' }) }}
                      className={`w-full px-4 py-3 border rounded-xl text-[14px] focus:outline-none focus:ring-2 transition-all ${errors.name ? 'border-red-300 bg-red-50/50 focus:ring-red-200' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'}`}
                      placeholder="Abdulloh"
                    />
                    {errors.name && <p className="text-[12px] text-red-500 mt-1.5 font-medium">{errors.name}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <Phone className="w-3.5 h-3.5" />
                      {t('order.phone_label')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={phone}
                      onFocus={handlePhoneFocus}
                      onChange={handlePhoneChange}
                      className={`w-full px-4 py-3 border rounded-xl text-[14px] tracking-wide focus:outline-none focus:ring-2 transition-all ${errors.phone ? 'border-red-300 bg-red-50/50 focus:ring-red-200' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'}`}
                      placeholder="+998 (90) 123-45-67"
                    />
                    {errors.phone && <p className="text-[12px] text-red-500 mt-1.5 font-medium">{errors.phone}</p>}
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {t('order.comment_label')}
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none transition-all"
                      placeholder={t('contact.comment_placeholder')}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 w-full flex items-center justify-center gap-2 text-[14px] font-bold text-white py-3.5 rounded-xl border-none cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:cursor-wait"
                    style={{ background: '#004FF1' }}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {t('order.submit')}
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
