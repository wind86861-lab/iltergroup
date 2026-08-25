import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, Save, X, GripVertical, ListOrdered } from 'lucide-react'
import { fetchSteps, createStep, updateStep, deleteStep, type ApiStep } from '../../lib/api'
import type { Localized } from '../../i18n/localized'

const LANGUAGES = ['uz', 'ru', 'en', 'tr'] as const
const DEFAULT_LOCALIZED: Localized = { uz: '', ru: '', en: '', tr: '' }

const AVAILABLE_ICONS = [
  'ClipboardList', 'MessageSquare', 'MapPin', 'Truck', 'ShoppingCart',
  'Phone', 'Mail', 'Package', 'CheckCircle', 'Clock', 'Star', 'Zap',
  'Heart', 'Shield', 'Award', 'TrendingUp', 'Users', 'Globe',
]

export default function StepsPage() {
  const [steps, setSteps] = useState<ApiStep[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ApiStep | null>(null)
  const [isNew, setIsNew] = useState(false)

  const load = () => {
    setLoading(true)
    fetchSteps()
      .then(s => setSteps(s.sort((a, b) => a.num - b.num)))
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить шаг?')) return
    await deleteStep(id)
    load()
  }

  const handleSave = async () => {
    if (!editing) return
    const data = {
      num: editing.num,
      icon: editing.icon,
      title: JSON.stringify(editing.title),
      text: JSON.stringify(editing.text),
    }
    try {
      if (isNew) {
        await createStep(data)
      } else {
        await updateStep(editing.id, data)
      }
      setEditing(null)
      setIsNew(false)
      load()
    } catch (err) {
      alert('Ошибка сохранения')
    }
  }

  const startNew = () => {
    setIsNew(true)
    setEditing({ id: 0, num: steps.length + 1, icon: 'ClipboardList', title: { ...DEFAULT_LOCALIZED }, text: { ...DEFAULT_LOCALIZED } })
  }

  const startEdit = (s: ApiStep) => {
    setIsNew(false)
    setEditing({
      ...s,
      title: typeof s.title === 'string' ? JSON.parse(s.title) : s.title,
      text: typeof s.text === 'string' ? JSON.parse(s.text) : s.text,
    })
  }

  const updateField = (field: 'num' | 'icon', value: string | number) => {
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
          <h1 className="text-2xl font-bold text-slate-900">Шаги работы</h1>
          <p className="text-sm text-slate-400 mt-1">Секция "Biz qanday ishlaymiz" — процесс работы с клиентами</p>
          <p className="text-xs text-slate-300 mt-0.5">💡 Добавьте шаги, выберите иконки, заполните тексты на всех языках</p>
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-2 text-sm font-bold text-white bg-brand px-5 py-2.5 rounded-xl border-none cursor-pointer hover:bg-brand-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить шаг
        </button>
      </div>

      {editing && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-900">{isNew ? 'Новый шаг' : 'Редактирование'}</h3>
            <button onClick={() => { setEditing(null); setIsNew(false) }} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border-none cursor-pointer hover:bg-slate-200">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Номер шага</label>
              <input
                type="number"
                value={editing.num}
                onChange={e => updateField('num', Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Иконка (Lucide)</label>
              <select
                value={editing.icon}
                onChange={e => updateField('icon', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand bg-white"
              >
                {AVAILABLE_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          {/* Title translations */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Заголовок</label>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map(lang => (
                <div key={lang} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-slate-400 rounded px-1.5 py-0.5 uppercase flex-shrink-0">{lang}</span>
                  <input
                    value={((typeof editing.title === 'string' ? JSON.parse(editing.title) : editing.title) as Localized)[lang] || ''}
                    onChange={e => updateLocalized('title', lang, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                    placeholder={`Title ${lang.toUpperCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Text translations */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Описание</label>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map(lang => (
                <div key={lang} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-slate-400 rounded px-1.5 py-0.5 uppercase flex-shrink-0">{lang}</span>
                  <input
                    value={((typeof editing.text === 'string' ? JSON.parse(editing.text) : editing.text) as Localized)[lang] || ''}
                    onChange={e => updateLocalized('text', lang, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                    placeholder={`Text ${lang.toUpperCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 text-sm font-bold text-white bg-brand px-6 py-2.5 rounded-xl border-none cursor-pointer hover:bg-brand-dark transition-colors"
          >
            <Save className="w-4 h-4" />
            Сохранить
          </button>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Загрузка...</div>
          ) : steps.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">Шаги не добавлены</div>
          ) : (
            steps.map(step => (
              <div key={step.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-brand">{step.num}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold text-slate-800 truncate">
                    {typeof step.title === 'string' ? JSON.parse(step.title).ru : step.title.ru}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {step.icon} · {typeof step.text === 'string' ? JSON.parse(step.text).ru : step.text.ru}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEdit(step)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer hover:bg-slate-100 text-slate-400 hover:text-brand transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(step.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
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
