import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, Save, X, Settings, Link, Phone, Mail, MapPin } from 'lucide-react'
import { fetchSiteConfig, updateSiteConfig, fetchFooterLinks, createFooterLink, updateFooterLink, deleteFooterLink, type SiteConfig, type FooterLink } from '../../lib/api'

const COLUMNS = [
  { key: 'about', label: 'О компании' },
  { key: 'products', label: 'Продукты' },
  { key: 'contacts', label: 'Контакты' },
]

export default function FooterPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [links, setLinks] = useState<FooterLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null)
  const [isNewLink, setIsNewLink] = useState(false)

  const load = async () => {
    setLoading(true)
    const [c, l] = await Promise.allSettled([fetchSiteConfig(), fetchFooterLinks()])
    if (c.status === 'fulfilled') setConfig(c.value)
    if (l.status === 'fulfilled') setLinks(l.value.sort((a, b) => a.order - b.order))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const saveConfig = async () => {
    if (!config) return
    setSaving(true)
    try {
      await updateSiteConfig({
        phone: config.phone,
        email: config.email,
        address: config.address,
        tagline: config.tagline,
      })
      alert('Сохранено')
    } catch {
      alert('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLink = async (id: number) => {
    if (!confirm('Удалить ссылку?')) return
    await deleteFooterLink(id)
    load()
  }

  const handleSaveLink = async () => {
    if (!editingLink) return
    try {
      if (isNewLink) {
        await createFooterLink(editingLink)
      } else {
        await updateFooterLink(editingLink.id, editingLink)
      }
      setEditingLink(null)
      setIsNewLink(false)
      load()
    } catch {
      alert('Ошибка сохранения ссылки')
    }
  }

  const startNewLink = (column: string) => {
    setIsNewLink(true)
    setEditingLink({ id: 0, label: '', href: '#', column, order: links.filter(l => l.column === column).length, createdAt: '' })
  }

  const startEditLink = (l: FooterLink) => {
    setIsNewLink(false)
    setEditingLink({ ...l })
  }

  const updateConfigField = (field: keyof SiteConfig, value: string) => {
    if (!config) return
    setConfig({ ...config, [field]: value })
  }

  const updateLinkField = (field: keyof FooterLink, value: string | number) => {
    if (!editingLink) return
    setEditingLink({ ...editingLink, [field]: value })
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Настройки футера</h1>
          <p className="text-sm text-slate-400 mt-1">Управление всем содержимым футера сайта</p>
          <p className="text-xs text-slate-300 mt-0.5">💡 Настройте контакты, адрес, описание и ссылки в трёх колонках</p>
        </div>
      </div>

      {/* Site Config */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Settings className="w-5 h-5 text-brand" />
          <h2 className="text-lg font-bold text-slate-900">Основная информация</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Телефон</label>
            <input value={config?.phone || ''} onChange={e => updateConfigField('phone', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
            <input value={config?.email || ''} onChange={e => updateConfigField('email', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Адрес</label>
            <input value={config?.address || ''} onChange={e => updateConfigField('address', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Описание (tagline)</label>
            <textarea value={config?.tagline || ''} onChange={e => updateConfigField('tagline', e.target.value)} rows={2} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand resize-none" />
          </div>
        </div>
        <button
          onClick={saveConfig}
          disabled={saving}
          className="flex items-center gap-2 text-sm font-bold text-white bg-brand px-6 py-2.5 rounded-xl border-none cursor-pointer hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      {/* Footer Links */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Link className="w-5 h-5 text-brand" />
          <h2 className="text-lg font-bold text-slate-900">Ссылки в футере</h2>
        </div>

        {editingLink && (
          <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-200">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Название</label>
                <input value={editingLink.label} onChange={e => updateLinkField('label', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ссылка</label>
                <input value={editingLink.href} onChange={e => updateLinkField('href', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Колонка</label>
                <select value={editingLink.column} onChange={e => updateLinkField('column', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand bg-white">
                  {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Порядок</label>
                <input type="number" value={editingLink.order} onChange={e => updateLinkField('order', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveLink} className="flex items-center gap-1.5 text-sm font-bold text-white bg-brand px-4 py-2 rounded-xl border-none cursor-pointer hover:bg-brand-dark">
                <Save className="w-3.5 h-3.5" /> Сохранить
              </button>
              <button onClick={() => { setEditingLink(null); setIsNewLink(false) }} className="flex items-center gap-1.5 text-sm font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl border-none cursor-pointer hover:bg-slate-200">
                <X className="w-3.5 h-3.5" /> Отмена
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {COLUMNS.map(col => {
            const colLinks = links.filter(l => l.column === col.key)
            return (
              <div key={col.key} className="border border-slate-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-700">{col.label}</h3>
                  <button onClick={() => startNewLink(col.key)} className="w-6 h-6 rounded-md bg-brand-light flex items-center justify-center border-none cursor-pointer hover:bg-brand/20">
                    <Plus className="w-3.5 h-3.5 text-brand" />
                  </button>
                </div>
                <div className="space-y-2">
                  {colLinks.length === 0 && <p className="text-xs text-slate-400 py-2">Нет ссылок</p>}
                  {colLinks.map(l => (
                    <div key={l.id} className="flex items-center gap-2 group">
                      <span className="text-xs text-slate-500 flex-1 truncate">{l.label}</span>
                      <button onClick={() => startEditLink(l)} className="w-6 h-6 rounded-md flex items-center justify-center border-none cursor-pointer hover:bg-slate-100 text-slate-300 hover:text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDeleteLink(l.id)} className="w-6 h-6 rounded-md flex items-center justify-center border-none cursor-pointer hover:bg-red-50 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
