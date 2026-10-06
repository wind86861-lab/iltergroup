import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LayoutGrid, CheckCircle, ExternalLink, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { fetchProducts, type Product } from '../../lib/api'
import { productImage } from '../../lib/images'
import { pickLocale } from '../../i18n/localized'
import { loadCategories, getCategoryBySlug, type Category } from '../../lib/categories'
import SectionTag from '../ui/SectionTag'
import OrderModal from '../ui/OrderModal'

export default function Catalog() {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<string>('all')
  const [selected, setSelected] = useState<Product | null>(null)
  const [orderProduct, setOrderProduct] = useState<string | null>(null)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  const [categories, setCategories] = useState<Category[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    loadCategories().then(list => { if (alive) setCategories(list) })
    fetchProducts()
      .then(list => { if (alive) setAllProducts(list) })
      .catch(() => { /* ignore */ })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const filtered = activeTab === 'all' ? allProducts : allProducts.filter((p) => p.category === activeTab)

  const handleClose = useCallback(() => setSelected(null), [])

  return (
    <section id="catalog" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header row */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-3"
        >
          <SectionTag>
            <LayoutGrid className="w-3 h-3" />
            {t('catalog.tag')}
          </SectionTag>
          <h2 className="font-heading text-[clamp(28px,3.2vw,46px)] text-ink leading-[1.12] mb-2">
            {t('catalog.title1')} <em className="text-brand not-italic italic">{t('catalog.title2')}</em>
          </h2>
          <p className="text-[15px] text-ink-muted max-w-[440px] leading-[1.7]">{t('catalog.sub')}</p>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="flex gap-2 flex-wrap mb-8 mt-6"
        >
          <motion.button
            onClick={() => setActiveTab('all')}
            whileTap={{ scale: 0.95 }}
            className={`text-[13.5px] font-semibold px-5 py-2.5 rounded-full border font-body cursor-pointer transition-all duration-200 ${activeTab === 'all'
              ? 'bg-brand text-white border-brand shadow-brand'
              : 'bg-surface-sand text-ink-muted border-transparent hover:border-brand/30 hover:text-ink'
              }`}
          >
            {t('catalog.all')}
          </motion.button>
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => setActiveTab(cat.slug)}
              whileTap={{ scale: 0.95 }}
              className={`text-[13.5px] font-semibold px-5 py-2.5 rounded-full border font-body cursor-pointer transition-all duration-200 ${activeTab === cat.slug
                ? 'text-white border-transparent shadow-brand'
                : 'bg-surface-sand text-ink-muted border-transparent hover:border-brand/30 hover:text-ink'
                }`}
              style={activeTab === cat.slug ? { background: cat.iconColor } : {}}
            >
              {pickLocale(cat.name, i18n.language)}
            </motion.button>
          ))}
        </motion.div>

        {/* Product grid */}
        {loading ? (
          <div className="text-center py-16 text-ink-muted text-sm">Загрузка...</div>
        ) : allProducts.length === 0 ? (
          <div className="text-center py-16 text-ink-muted text-sm">{t('catalog.sub')}</div>
        ) : null}
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24, delay: i * 0.04 }}
              >
                <ProductCard product={product} onOpen={setSelected} onOrder={setOrderProduct} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal */}
      <ProductModal product={selected} onClose={handleClose} onRequest={setOrderProduct} />
      <OrderModal productName={orderProduct} onClose={() => setOrderProduct(null)} />
    </section>
  )
}

/* ── Product Card ── */
interface CardProps {
  product: Product
  onOpen: (p: Product) => void
  onOrder: (productName: string) => void
}

function ProductCard({ product, onOpen, onOrder }: CardProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const name = pickLocale(product.name, lang)
  const label = pickLocale(product.label, lang)
  const catLabel = (() => {
    const cat = getCategoryBySlug(product.category)
    if (cat) return pickLocale(cat.name, lang)
    const key = `catalog.${product.category}`
    const resolved = t(key)
    // Strip 'catalog.' prefix if present
    return resolved.replace(/^catalog\./, '')
  })()

  return (
    <motion.div
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      onClick={() => onOpen(product)}
      className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer shadow-card hover:shadow-brand-lg transition-shadow duration-300"
      style={{ border: '1px solid rgba(0,79,241,0.08)' }}
    >
      {/* Accent top border on hover */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10 rounded-t-3xl" />

      {/* Full-bleed image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <img
          src={productImage(product)}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 100%)' }} />

        {/* Category glass pill */}
        <span
          className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: product.iconColor,
            border: `1px solid ${product.iconColor}30`,
          }}
        >
          {catLabel}
        </span>

        {/* Hover quick-action button */}
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.94 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-3 right-3 w-9 h-9 bg-brand rounded-full flex items-center justify-center border-none cursor-pointer shadow-brand opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onOrder(name) }}
        >
          <ShoppingCart className="w-4 h-4 text-white" strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* Info */}
      <div className="px-4 pt-3 pb-4">
        <h4 className="text-[14px] font-bold text-ink leading-snug mb-1 group-hover:text-brand transition-colors duration-200">
          {name}
        </h4>
        <p className="text-[12px] text-ink-muted leading-snug line-clamp-1">{label}</p>
        {/* View detail hint */}
        <div className="flex items-center gap-1 mt-2.5 text-[11.5px] font-semibold text-brand opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
          {t('catalog.order')}
          <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M8 3l5 5-5 5" /></svg>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Product Modal ── */
interface ModalProps {
  product: Product | null
  onClose: () => void
  onRequest: (productName: string) => void
}

function ProductModal({ product, onClose, onRequest }: ModalProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const name = product ? pickLocale(product.name, lang) : ''
  const desc = product ? pickLocale(product.description, lang) : ''
  const categoryLabel = (() => {
    if (!product) return ''
    const cat = getCategoryBySlug(product.category)
    if (cat) return (pickLocale(cat.name, lang) || product.category).toUpperCase()
    return (t(`catalog.${product.category}`) || product.category).toUpperCase()
  })()

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          style={{ backgroundColor: 'rgba(14,18,32,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[24px] overflow-hidden w-full max-w-[920px] max-h-[90vh] grid grid-cols-1 lg:grid-cols-2 relative"
            style={{ boxShadow: '0 25px 60px -15px rgba(0,0,0,0.25)' }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center border-none cursor-pointer transition-all shadow-md hover:shadow-lg hover:scale-110"
            >
              <X className="w-4 h-4 text-slate-500" strokeWidth={2.5} />
            </button>

            {/* Left: full-size product image */}
            <div className="relative overflow-hidden min-h-[280px] lg:min-h-[480px]">
              <img
                src={productImage(product)}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Right: content */}
            <div className="p-7 lg:p-9 flex flex-col overflow-y-auto">
              {/* Category pill */}
              <div className="mb-5">
                <span
                  className="text-[11px] font-bold px-3.5 py-1.5 rounded-full"
                  style={{ background: `${product.iconColor}12`, color: product.iconColor }}
                >
                  {categoryLabel}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-heading text-[26px] lg:text-[30px] text-slate-900 leading-tight font-bold tracking-tight mb-3">
                {name}
              </h2>

              {/* Description */}
              <p className="text-[14px] text-slate-500 leading-relaxed mb-6">
                {desc}
              </p>

              {/* Features */}
              {(product.features || []).length > 0 && (
                <div className="mb-7">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    {t('modal.features')}
                  </h3>
                  <div className="space-y-2.5">
                    {product.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <CheckCircle className="w-[18px] h-[18px] text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
                        <span className="text-[14px] text-slate-700 font-medium">
                          {pickLocale(feat, lang)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-auto pt-2">
                <a
                  href={product?.uzumLink || 'https://uzum.uz'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 text-[13px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 py-3.5 rounded-xl no-underline transition-all"
                >
                  <ExternalLink className="w-4 h-4" strokeWidth={2} />
                  {t('modal.view_uzum')}
                </a>
                <button
                  onClick={() => { onRequest(name); onClose() }}
                  className="flex-1 flex items-center justify-center gap-2 text-[13px] font-bold text-white py-3.5 rounded-xl border-none cursor-pointer transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
                  style={{ background: '#004FF1' }}
                >
                  {t('modal.request')}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 16 16">
                    <path d="M3 8h10M8 3l5 5-5 5" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
