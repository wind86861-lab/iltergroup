import { useEffect, useState, useRef } from 'react'
import { Plus, Trash2, Pencil, Save, X, Upload, Image } from 'lucide-react'
import { fetchPartners, createPartner, updatePartner, deletePartner, type ApiPartner, API_BASE } from '../../lib/api'

const DEFAULT_COLORS = ['#004FF1', '#004FF1', '#e63946', '#1d3557', '#6d4c41', '#388e3c', '#7b2d8b', '#f59e0b', '#ef4444', '#8b5cf6']

function imageUrl(src: string) {
  if (!src) return ''
  if (src.startsWith('http') || src.startsWith('data:')) return src
  return `${API_BASE}${src}`
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<ApiPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ApiPartner | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    fetchPartners()
      .then(p => setPartners(p.sort((a, b) => a.order - b.order)))
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить партнёра?')) return
    await deletePartner(id)
    load()
  }

  const handleSave = async () => {
    if (!editing) return
    const fd = new FormData()
    fd.append('name', editing.name)
    fd.append('type', editing.type)
    fd.append('color', editing.color)
    fd.append('order', String(editing.order))
    if (imageFile) fd.append('image', imageFile)
    try {
      if (isNew) {
        await createPartner(fd)
      } else {
        await updatePartner(editing.id, fd)
      }
      setEditing(null)
      setIsNew(false)
      setImageFile(null)
      setImagePreview('')
      load()
    } catch (err) {
      alert('Ошибка сохранения')
    }
  }

  const startNew = () => {
    setIsNew(true)
    setImageFile(null)
    setImagePreview('')
    setEditing({ id: 0, name: '', type: '', color: DEFAULT_COLORS[0], image: '', order: partners.length, createdAt: '', updatedAt: '' })
  }

  const startEdit = (p: ApiPartner) => {
    setIsNew(false)
    setImageFile(null)
    setImagePreview(p.image ? imageUrl(p.image) : '')
    setEditing({ ...p })
  }

  const updateField = (field: keyof ApiPartner, value: string | number) => {
    if (!editing) return
    setEditing({ ...editing, [field]: value })
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Партнёры</h1>
          <p className="text-sm text-slate-400 mt-1">Секция "Bizning hamkorlar" — бегущая строка с партнёрами</p>
          <p className="text-xs text-slate-300 mt-0.5">💡 Загрузите логотип партнёра (PNG, JPG, WEBP)</p>
        </div>
        <button onClick={startNew} className="flex items-center gap-2 text-sm font-bold text-white bg-brand px-5 py-2.5 rounded-xl border-none cursor-pointer hover:bg-brand-dark transition-colors">
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      {editing && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-900">{isNew ? 'Новый партнёр' : 'Редактирование'}</h3>
            <button onClick={() => { setEditing(null); setIsNew(false); setImageFile(null); setImagePreview('') }} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border-none cursor-pointer hover:bg-slate-200">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Image upload */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Логотип партнёра</label>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0"
                style={{ background: editing.color }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-contain p-1" />
                ) : (
                  <Image className="w-6 h-6 text-white/60" />
                )}
              </div>
              <div className="flex-1">
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImageSelect} className="hidden" />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border-none cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {imagePreview ? 'Заменить изображение' : 'Загрузить изображение'}
                </button>
                <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP · макс. 5MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Название</label>
              <input value={editing.name} onChange={e => updateField('name', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Тип</label>
              <input value={editing.type} onChange={e => updateField('type', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Порядок</label>
              <input type="number" value={editing.order} onChange={e => updateField('order', Number(e.target.value))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Цвет фона</label>
            <div className="flex items-center gap-3">
              <input type="color" value={editing.color} onChange={e => updateField('color', e.target.value)} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer flex-shrink-0" />
              <input value={editing.color} onChange={e => updateField('color', e.target.value)} className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand font-mono" placeholder="#004FF1" />
              {DEFAULT_COLORS.map(c => (
                <button key={c} onClick={() => updateField('color', c)} className="w-7 h-7 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform" style={{ background: c }} />
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
          ) : partners.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">Партнёры не добавлены</div>
          ) : (
            partners.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: p.color }}>
                  {p.image ? (
                    <img src={imageUrl(p.image)} alt={p.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Image className="w-5 h-5 text-white/60" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold text-slate-800 truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-400">{p.type}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(p)} className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer hover:bg-slate-100 text-slate-400 hover:text-brand transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
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
