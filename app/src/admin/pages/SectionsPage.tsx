import { useEffect, useState } from 'react'
import { Save, Type, ArrowRight } from 'lucide-react'
import { fetchSectionTexts, updateSectionText, type SectionTextMap } from '../../lib/api'

const SECTIONS = [
  { key: 'why', label: 'Nima uchun bizni tanladilar', desc: 'Почему мы' },
  { key: 'partners', label: 'Bizning hamkorlar', desc: 'Наши партнёры' },
  { key: 'how', label: 'Biz qanday ishlaymiz', desc: 'Как мы работаем' },
]

const LANGUAGES = ['uz', 'ru', 'en', 'tr'] as const

const DEFAULTS: SectionTextMap = {
  'why.title': { uz: 'Nima uchun', ru: 'Почему', en: 'Why', tr: 'Neden' },
  'why.title2': { uz: 'bizni tanladilar', ru: 'выбирают нас', en: 'choose us', tr: 'bizi seçiyor' },
  'why.sub': { uz: 'Biz faqat ishonchli ta\'minotchilardan sifatli mahsulotlar taqdim etamiz', ru: 'Мы предлагаем качественные продукты только от проверенных поставщиков', en: 'We offer quality products only from trusted suppliers', tr: 'Sadece güvenilir tedarikçilerden kaliteli ürünler sunuyoruz' },
  'partners.title': { uz: 'Bizning hamkorlar', ru: 'Наши партнёры', en: 'Our Partners', tr: 'Ortaklarımız' },
  'partners.sub': { uz: 'Biz bilan ishonchli hamkorlar', ru: 'Надёжные партнёры с нами', en: 'Trusted partners with us', tr: 'Güvenilir ortaklarımız' },
  'how.title': { uz: 'Biz qanday', ru: 'Как мы', en: 'How we', tr: 'Nasıl' },
  'how.title2': { uz: 'ishlaymiz', ru: 'работаем', en: 'work', tr: 'çalışıyoruz' },
  'how.sub': { uz: 'Buyurtma berishdan yetkazib berishgacha — oddiy va shaffof', ru: 'От заказа до доставки — просто и прозрачно', en: 'From order to delivery — simple and transparent', tr: 'Siparişten teslimata — basit ve şeffaf' },
}

export default function SectionsPage() {
  const [texts, setTexts] = useState<SectionTextMap>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchSectionTexts()
      .then(t => setTexts({ ...DEFAULTS, ...t }))
      .catch(() => setTexts(DEFAULTS))
      .finally(() => setLoading(false))
  }, [])

  const updateText = (key: string, lang: string, value: string) => {
    setTexts(prev => ({
      ...prev,
      [key]: { ...prev[key], [lang]: value },
    }))
  }

  const handleSave = async (key: string) => {
    setSaving(key)
    try {
      await updateSectionText(key, texts[key])
    } catch {
      alert('Ошибка сохранения')
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <div className="max-w-5xl p-10 text-center text-slate-400">Загрузка...</div>

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Тексты секций</h1>
        <p className="text-sm text-slate-400 mt-1">Редактирование заголовков и описаний секций на сайте</p>
        <p className="text-xs text-slate-300 mt-0.5">💡 Измените текст для каждого языка и нажмите Сохранить</p>
      </div>

      {SECTIONS.map(section => (
        <div key={section.key} className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Type className="w-5 h-5 text-brand" />
            <h2 className="text-lg font-bold text-slate-900">{section.desc} — <span className="text-slate-500 font-normal">{section.label}</span></h2>
          </div>

          {['title', 'title2', 'sub'].map(subKey => {
            const fullKey = `${section.key}.${subKey}`
            const current = texts[fullKey] || DEFAULTS[fullKey] || {}
            const isTitle = subKey.startsWith('title')
            return (
              <div key={fullKey} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {isTitle ? (subKey === 'title2' ? 'Заголовок (часть 2)' : 'Заголовок') : 'Описание'}
                  </label>
                  <button
                    onClick={() => handleSave(fullKey)}
                    disabled={saving === fullKey}
                    className="flex items-center gap-1 text-[11px] font-bold text-white bg-brand px-3 py-1 rounded-lg border-none cursor-pointer hover:bg-brand-dark transition-colors disabled:opacity-60"
                  >
                    <Save className="w-3 h-3" />
                    {saving === fullKey ? '...' : 'Сохранить'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map(lang => (
                    <div key={lang} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-white bg-slate-400 rounded px-1.5 py-0.5 uppercase flex-shrink-0">{lang}</span>
                      <input
                        value={current[lang] || ''}
                        onChange={e => updateText(fullKey, lang, e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                        placeholder={`${isTitle ? 'Title' : 'Text'} ${lang.toUpperCase()}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
