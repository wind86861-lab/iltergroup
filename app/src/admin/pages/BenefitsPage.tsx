import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, Save, X, ShieldCheck } from 'lucide-react'
import { fetchBenefits, createBenefit, updateBenefit, deleteBenefit, type ApiBenefit } from '../../lib/api'
import type { Localized } from '../../i18n/localized'

const LANGUAGES = ['uz', 'ru', 'en', 'tr'] as const
const DEFAULT_LOCALIZED: Localized = { uz: '', ru: '', en: '', tr: '' }

const AVAILABLE_ICONS = [
  'ShieldCheck', 'Clock', 'Leaf', 'Zap', 'Heart', 'Award', 'Star', 'TrendingUp',
  'Truck', 'Package', 'CheckCircle', 'Smile', 'ThumbsUp', 'Sun', 'Coffee',
]

export default function BenefitsPage() {
  const [items, setItems] = useState<ApiBenefit[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ApiBenefit | null>(null)
  const [isNew, setIsNew] = useState(false)

  const load = () => {
    setLoading(true)
    fetchBenefits()
      .then(b => setItems(b.sort((a, b) => a.order - b.order)))
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить?')) return
    await deleteBenefit(id)
    load()
  }

  const handleSave = async () => {
    if (!editing) return
    const data = {
      icon: editing.icon,
      title: JSON.stringify(editing.title),
      text: JSON.stringify(editing.text),
      color: editing.color,
      order: editing.order,
    }
    try {
      if (isNew) await createBenefit(data)
      else await updateBenefit(editing.id, data)
      setEditing(null)
      setIsNew(false)
      load()
    } catch { alert('Ошибка сохранения') }
  }

  const startNew = () => {
    setIsNew(true)
    setEditing({ id: 0, icon: 'ShieldCheck', title: { ...DEFAULT_LOCALIZED }, text: { ...DEFAULT_LOCALIZED }, color: '#004FF1', order: items.length })
  }

  const startEdit = (b: ApiBenefit) => {
    setIsNew(false)
    setEditing({
      ...b,
      title: typeof b.title === 'string' ? JSON.parse(b.title) : b.title,
      text: typeof b.text === 'string' ? JSON.parse(b.text) : b.text,
    })
  }

  const updateField = (field: 'icon' | 'color' | 'order', value: string | number) => {
    if (!editing) return
    setEditing({ ...editing, [field]: value })
  }

  const updateLocalized = (field: 'title' | 'text', lang: string, value: string) => {
    if (!editing) return
    const current = { ...(typeof editing[field] === 'string' ? JSON.parse(editing[field]) : editing[field]) }
    setEditing({ ...editing, [field]: { ...current, [lang]: value } })
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Преимущества</h1>
          <p className="text-sm text-slate-400 mt-1">Секция "Nima uchun bizni tanladilar" — почему выбирают нас</p>
          <p className="text-xs text-slate-300 mt-0.5">💡 Создайте карточки с иконками, заголовками и описаниями на всех языках</p>
        </div>
        <button onClick={startNew} className="flex items-center gap-2 text-sm font-bold text-white bg-brand px-5 py-2.5 rounded-xl border-none cursor-pointer hover:bg-brand-dark transition-colors">
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      {editing && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-900">{isNew ? 'Новое преимущество' : 'Редактирование'}</h3>
            <button onClick={() => { setEditing(null); setIsNew(false) }} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border-none cursor-pointer hover:bg-slate-200">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Иконка</label>
              <select value={editing.icon} onChange={e => updateField('icon', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand bg-white">
                {AVAILABLE_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Порядок</label>
              <input type="number" value={editing.order} onChange={e => updateField('order', Number(e.target.value))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Цвет</label>
              <div className="flex items-center gap-2">
                <input type="color" value={editing.color} onChange={e => updateField('color', e.target.value)} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer flex-shrink-0" />
                <input value={editing.color} onChange={e => updateField('color', e.target.value)} className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand font-mono" />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Заголовок</label>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map(lang => (
                <div key={lang} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-slate-400 rounded px-1.5 py-0.5 uppercase flex-shrink-0">{lang}</span>
                  <input value={((typeof editing.title === 'string' ? JSON.parse(editing.title) : editing.title) as Localized)[lang] || ''} onChange={e => updateLocalized('title', lang, e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand" placeholder={`Title ${lang.toUpperCase()}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Описание</label>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map(lang => (
                <div key={lang} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-slate-400 rounded px-1.5 py-0.5 uppercase flex-shrink-0">{lang}</span>
                  <input value={((typeof editing.text === 'string' ? JSON.parse(editing.text) : editing.text) as Localized)[lang] || ''} onChange={e => updateLocalized('text', lang, e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand" placeholder={`Text ${lang.toUpperCase()}`} />
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSave} className="flex items-center gap-2 text-sm font-bold text-white bg-brand px-6 py-2.5 rounded-xl border-none cursor-pointer hover:bg-brand-dark transition-colors">
            <Save className="w-4 h-4" /> Сохранить
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Загрузка...</div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">Нет преимуществ</div>
          ) : (
            items.map(b => (
              <div key={b.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: b.color }}>{b.icon[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold text-slate-800 truncate">{typeof b.title === 'string' ? JSON.parse(b.title).ru : b.title.ru}</p>
                  <p className="text-[11px] text-slate-400 truncate">{b.icon} · {typeof b.text === 'string' ? JSON.parse(b.text).ru : b.text.ru}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(b)} className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer hover:bg-slate-100 text-slate-400 hover:text-brand transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
