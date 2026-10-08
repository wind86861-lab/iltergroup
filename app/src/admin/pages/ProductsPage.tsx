import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Search, Upload, X, Check, ImageIcon, Package, Star } from 'lucide-react'
import { EMPTY_LOCALIZED, pickLocale, type Localized } from '../../i18n/localized'
import { SUPPORTED_LANGS, type Lang } from '../../i18n'
import {
  fetchProducts, createProduct, updateProduct, deleteProduct,
  type Product, type ProductInput,
} from '../../lib/api'
import { productImage, FALLBACK_IMAGES } from '../../lib/images'
import { loadCategories, getCategoryBySlug, type Category } from '../../lib/categories'
import ImageAdvice, { IMAGE_SPECS } from '../components/ImageAdvice'

const LANG_LABEL: Record<Lang, string> = { uz: 'UZ', ru: 'RU', en: 'EN', tr: 'TR' }

const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(n) + ' сум'
const hasAnyText = (l: Localized) => SUPPORTED_LANGS.some(k => (l[k] || '').trim().length > 0)

interface Draft {
  id: number | null
  name: Localized
  description: Localized
  label: Localized
  category: string
  gradient: string
  iconColor: string
  stock: number
  price: number
  isTop: boolean
  uzumLink?: string
  features: Localized[]
  /** temporary field for adding new feature */
  _newFeature?: Localized
  /** existing API-served URL (e.g. "/uploads/..") */
  imageUrl: string | null
  /** new file picked locally for upload */
  imageFile: File | null
  /** browser-only data URL for preview after picking a file */
  imagePreview: string | null
}

const BLANK_DRAFT: Draft = {
  id: null,
  name: { ...EMPTY_LOCALIZED },
  description: { ...EMPTY_LOCALIZED },
  label: { ...EMPTY_LOCALIZED },
  category: '',
  gradient: 'from-amber-50 to-orange-100',
  iconColor: '#d97706',
  stock: 0,
  price: 0,
  isTop: false,
  uzumLink: '',
  features: [],
  imageUrl: null,
  imageFile: null,
  imagePreview: null,
}

function draftFromProduct(p: Product): Draft {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    label: p.label,
    category: p.category,
    gradient: p.gradient || 'from-amber-50 to-orange-100',
    iconColor: p.iconColor || '#d97706',
    stock: p.stock,
    price: p.price,
    isTop: (p as any).isTop ?? false,
    uzumLink: p.uzumLink || '',
    features: p.features || [],
    imageUrl: p.image,
    imageFile: null,
    imagePreview: null,
  }
}

function toInput(d: Draft): ProductInput {
  return {
    name: d.name,
    description: d.description,
    label: d.label,
    category: d.category,
    gradient: d.gradient,
    iconColor: d.iconColor,
    stock: d.stock,
    price: d.price,
    isTop: d.isTop,
    image: d.imageFile,
    uzumLink: d.uzumLink,
    features: d.features,
  }
}

export default function ProductsPage() {
  const { t, i18n } = useTranslation()
  const uiLang = (SUPPORTED_LANGS as readonly string[]).includes(i18n.language) ? (i18n.language as Lang) : 'ru'

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState<string>('all')
  const [editing, setEditing] = useState<Draft | null>(null)
  const [editLang, setEditLang] = useState<Lang>(uiLang)
  const [isNew, setIsNew] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let alive = true
    loadCategories().then(list => { if (alive) setCategories(list) })
    fetchProducts()
      .then(list => { if (alive) setProducts(list) })
      .catch(err => { if (alive) setError(err instanceof Error ? err.message : 'Ошибка загрузки') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    if (cat !== 'all' && p.category !== cat) return false
    if (!q) return true
    return SUPPORTED_LANGS.some(l =>
      (p.name[l] || '').toLowerCase().includes(q) ||
      (p.label[l] || '').toLowerCase().includes(q),
    )
  })

  const openEdit = (p: Product) => { setIsNew(false); setEditing(draftFromProduct(p)); setEditLang(uiLang) }
  const openNew = () => { setIsNew(true); setEditing({ ...BLANK_DRAFT, category: categories[0]?.slug ?? '' }); setEditLang(uiLang) }

  const handleSave = async () => {
    if (!editing || !hasAnyText(editing.name)) return
    setSaving(true)
    try {
      const saved = isNew
        ? await createProduct(toInput(editing))
        : await updateProduct(editing.id!, toInput(editing))
      setProducts(prev => isNew
        ? [...prev, saved]
        : prev.map(p => p.id === saved.id ? saved : p),
      )
      setSaved(true)
      setTimeout(() => { setSaved(false); setEditing(null) }, 700)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      if (editing?.id === id) setEditing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить')
    } finally {
      setConfirmDelete(null)
    }
  }

  const pickImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => setEditing(prev => prev ? {
      ...prev,
      imageFile: file,
      imagePreview: e.target?.result as string,
    } : null)
    reader.readAsDataURL(file)
  }, [])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) pickImage(f)
  }

  const setLocField = (field: 'name' | 'description' | 'label', value: string) => {
    if (!editing) return
    setEditing({ ...editing, [field]: { ...editing[field], [editLang]: value } })
  }

  const previewSrc = editing
    ? (editing.imagePreview
      || (editing.imageUrl ? productImage({ image: editing.imageUrl, category: editing.category }) : null))
    : null
  const isNewDraft = editing?.id === null

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('admin.products.title')}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{products.length} {t('admin.products.count')}</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90 active:scale-[.97] transition-all"
          style={{ background: '#004FF1' }}
        >
          <Plus className="w-4 h-4" />
          {t('admin.common.add')}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`${t('admin.common.search')}...`}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCat('all')}
            className="px-3.5 py-2 text-[13px] font-semibold rounded-xl border transition-all"
            style={cat === 'all'
              ? { background: '#004FF1', color: '#fff', borderColor: '#004FF1' }
              : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }}
          >
            {t('admin.common.all')}
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCat(c.slug)}
              className="px-3.5 py-2 text-[13px] font-semibold rounded-xl border transition-all"
              style={cat === c.slug
                ? { background: c.iconColor, color: '#fff', borderColor: c.iconColor }
                : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }}
            >
              {pickLocale(c.name, uiLang)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400 text-sm">{t('admin.common.loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Package className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-semibold">{products.length === 0 ? t('admin.products.empty') : t('admin.common.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(p => {
            const category = getCategoryBySlug(p.category)
            const displayName = pickLocale(p.name, uiLang)
            return (
              <div
                key={p.id}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-green-200 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => openEdit(p)}
              >
                <div className="relative overflow-hidden bg-slate-50" style={{ aspectRatio: '4/3' }}>
                  <img
                    src={productImage(p)}
                    alt={displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={e => { e.stopPropagation(); openEdit(p) }}
                      className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-green-50 transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-slate-700" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmDelete(p.id) }}
                      className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  {category && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${category.iconColor}20`, color: category.iconColor }}>
                      {pickLocale(category.name, uiLang)}
                    </span>
                  )}
                  <div className="flex items-center gap-1 mt-1.5">
                    {(p as any).isTop && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
                    <h3 className="text-[13px] font-semibold text-slate-800 leading-snug line-clamp-1">{displayName}</h3>
                  </div>
                  <p className="text-[12px] text-slate-400 mt-0.5">{fmt(p.price)}</p>
                  <p className="text-[11px] text-slate-400">Склад: {p.stock} шт.</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit/Add Slide-over */}
      {editing && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => !saving && setEditing(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{isNew ? t('admin.products.new') : t('admin.common.edit')}</h2>
              <button onClick={() => setEditing(null)} disabled={saving} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors disabled:opacity-50">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Language tabs */}
            <div className="px-6 pt-4">
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                {SUPPORTED_LANGS.map(l => {
                  const filled = !!(editing.name[l] || editing.description[l] || editing.label[l])
                  return (
                    <button
                      key={l}
                      onClick={() => setEditLang(l)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-bold rounded-lg transition-all ${editLang === l
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {LANG_LABEL[l]}
                      {filled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Заполните поля для каждого языка. Точка — язык заполнен.
              </p>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-2">{t('admin.products.photo')}</label>
                <div
                  className="relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-colors"
                  style={{ aspectRatio: '4/3', borderColor: dragOver ? '#004FF1' : '#e2e8f0', borderStyle: 'dashed' }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  {previewSrc ? (
                    <>
                      <img src={previewSrc} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex flex-col items-center justify-center gap-2 group">
                        <Upload className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">{t('admin.products.change_photo')}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                      <ImageIcon className="w-10 h-10" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-600">{t('admin.products.upload_photo')}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{t('admin.products.upload_photo_formats')}</p>
                      </div>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) pickImage(f); e.target.value = '' }} />
                <ImageAdvice spec={IMAGE_SPECS.product} file={editing.imageFile} />
              </div>

              {/* Name */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  {t('admin.products.name')} * <span className="text-slate-400 font-normal">({LANG_LABEL[editLang]})</span>
                </label>
                <input
                  value={editing.name[editLang]}
                  onChange={e => setLocField('name', e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                  placeholder={t('admin.products.placeholder_name')}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  {t('admin.products.description')} <span className="text-slate-400 font-normal">({LANG_LABEL[editLang]})</span>
                </label>
                <textarea
                  value={editing.description[editLang]}
                  onChange={e => setLocField('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                  placeholder={t('admin.products.placeholder_desc')}
                />
              </div>

              {/* Label */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  {t('admin.products.label')} <span className="font-normal text-slate-400">({LANG_LABEL[editLang]})</span>
                </label>
                <input
                  value={editing.label[editLang]}
                  onChange={e => setLocField('label', e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                  placeholder={t('admin.products.placeholder_label')}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">{t('admin.products.category')}</label>
                <select
                  value={editing.category}
                  onChange={e => setEditing({ ...editing, category: e.target.value as Draft['category'] })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>
                      {pickLocale(cat.name, uiLang)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">{t('admin.products.price')}</label>
                  <input
                    type="number" min={0}
                    value={editing.price}
                    onChange={e => setEditing({ ...editing, price: +e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">{t('admin.products.stock')}</label>
                  <input
                    type="number" min={0}
                    value={editing.stock}
                    onChange={e => setEditing({ ...editing, stock: +e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Mark as Top */}
              <div className="flex items-center gap-3 p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
                <button
                  onClick={() => setEditing({ ...editing, isTop: !editing.isTop })}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${editing.isTop ? 'bg-amber-400 border-amber-400' : 'bg-white border-slate-300'}`}
                >
                  {editing.isTop && <Check className="w-3 h-3 text-white" />}
                </button>
                <div>
                  <label className="text-[13px] font-semibold text-amber-700 cursor-pointer" onClick={() => setEditing({ ...editing, isTop: !editing.isTop })}>
                    {t('admin.products.top_product')}
                  </label>
                  <p className="text-[11px] text-amber-500">{t('admin.products.top_desc')}</p>
                </div>
              </div>

              {/* Uzum Link */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">{t('admin.products.uzum_link')}</label>
                <input
                  type="url"
                  value={editing.uzumLink ?? ''}
                  onChange={e => setEditing({ ...editing, uzumLink: e.target.value || undefined })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                  placeholder="https://uzum.uz/..."
                />
              </div>

              {/* Features / Характеристики */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">{t('admin.products.features')}</label>
                <div className="space-y-2">
                  {editing.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0 text-xs space-y-0.5">
                        {SUPPORTED_LANGS.map(lang => {
                          const text = feat[lang]
                          if (!text) return null
                          return (
                            <div key={lang} className="flex items-center gap-1">
                              <span className="font-bold text-slate-400 uppercase w-6">{lang}:</span>
                              <span className="text-slate-700">{text}</span>
                            </div>
                          )
                        })}
                      </div>
                      <button
                        onClick={() => setEditing({ ...editing, features: editing.features.filter((_, idx) => idx !== i) })}
                        className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Add new feature form */}
                  <div className="border border-slate-200 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-semibold text-slate-600">{t('admin.products.add_feature')}</p>
                    {SUPPORTED_LANGS.map(lang => (
                      <div key={lang} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase w-8">{lang}</span>
                        <input
                          type="text"
                          value={(editing._newFeature || EMPTY_LOCALIZED)[lang]}
                          onChange={e => setEditing({
                            ...editing,
                            _newFeature: { ...(editing._newFeature || EMPTY_LOCALIZED), [lang]: e.target.value }
                          })}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const newFeat = editing._newFeature
                              if (newFeat && hasAnyText(newFeat)) {
                                setEditing({ ...editing, features: [...editing.features, newFeat], _newFeature: { ...EMPTY_LOCALIZED } })
                              }
                            }
                          }}
                          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                          placeholder={`${LANG_LABEL[lang]} текст...`}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newFeat = editing._newFeature
                        if (newFeat && hasAnyText(newFeat)) {
                          setEditing({ ...editing, features: [...editing.features, newFeat], _newFeature: { ...EMPTY_LOCALIZED } })
                        }
                      }}
                      className="w-full px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand hover:opacity-90 transition-opacity"
                    >
                      {t('admin.products.add_feature')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={!hasAnyText(editing.name) || saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                  style={{ background: saved ? '#059669' : '#004FF1' }}
                >
                  <Check className="w-4 h-4" />
                  {saved ? t('admin.common.saved') : saving ? t('admin.common.saving') : t('admin.common.save')}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  disabled={saving}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {t('admin.common.cancel')}
                </button>
              </div>
              {!isNew && editing.id != null && (
                <button
                  onClick={() => setConfirmDelete(editing.id)}
                  className="w-full text-[13px] text-red-400 hover:text-red-600 transition-colors py-1"
                >
                  {t('admin.common.delete')}
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Delete Confirm */}
      {confirmDelete != null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-[360px]">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-[17px] font-bold text-slate-900 mb-2">{t('admin.products.confirm_delete')}</h3>
            <p className="text-sm text-slate-500 mb-5">
              «{pickLocale(products.find(p => p.id === confirmDelete)?.name, uiLang)}» {t('admin.products.delete_warning')}
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors">
                {t('admin.common.delete')}
              </button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                {t('admin.common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
