import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCategories, saveCategories, type Category } from '../../lib/categories'
import { EMPTY_LOCALIZED } from '../../i18n/localized'

const BLANK: Omit<Category, 'id'> = {
  name: { ...EMPTY_LOCALIZED },
  slug: '',
  iconColor: '#004FF1',
  gradient: 'from-blue-50 to-cyan-100',
  order: 99,
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<Category | null>(null)
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    setCategories(getCategories())
  }, [])

  const save = (cat: Category) => {
    const updated = isNew
      ? [...categories, cat]
      : categories.map(c => (c.id === cat.id ? cat : c))
    setCategories(updated)
    saveCategories(updated)
    setEditing(null)
    setIsNew(false)
  }

  const remove = (id: string) => {
    if (!confirm('Удалить категорию?')) return
    const updated = categories.filter(c => c.id !== id)
    setCategories(updated)
    saveCategories(updated)
  }

  const handleNew = () => {
    setEditing({ ...BLANK, id: 'cat_' + Date.now() })
    setIsNew(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Категории продуктов</h1>
          <p className="text-sm text-slate-500 mt-1">Управление категориями для каталога</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg"
          style={{ background: '#004FF1' }}
        >
          <Plus className="w-4 h-4" />
          Добавить категорию
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <motion.div
            key={cat.id}
            layout
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${cat.iconColor}20, ${cat.iconColor}40)` }}
                >
                  <Package className="w-5 h-5" style={{ color: cat.iconColor }} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{cat.name.ru}</h3>
                  <p className="text-xs text-slate-400">#{cat.slug}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => { setEditing(cat); setIsNew(false) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => remove(cat.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 rounded-md bg-slate-50 text-slate-600">
                Цвет: {cat.iconColor}
              </span>
              <span className="px-2 py-1 rounded-md bg-slate-50 text-slate-600">
                Порядок: {cat.order}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => { setEditing(null); setIsNew(false) }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">
                  {isNew ? 'Новая категория' : 'Редактировать категорию'}
                </h2>
                <button
                  onClick={() => { setEditing(null); setIsNew(false) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Slug */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Slug (ID) *
                  </label>
                  <input
                    value={editing.slug}
                    onChange={e => setEditing({ ...editing, slug: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    placeholder="bread, sweet, fruit..."
                  />
                </div>

                {/* Names */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Название (RU) *
                    </label>
                    <input
                      value={editing.name.ru}
                      onChange={e => setEditing({ ...editing, name: { ...editing.name, ru: e.target.value } })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                      placeholder="Хлебобулочные"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Название (UZ) *
                    </label>
                    <input
                      value={editing.name.uz}
                      onChange={e => setEditing({ ...editing, name: { ...editing.name, uz: e.target.value } })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                      placeholder="Non mahsulotlari"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Название (EN)
                    </label>
                    <input
                      value={editing.name.en}
                      onChange={e => setEditing({ ...editing, name: { ...editing.name, en: e.target.value } })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                      placeholder="Bakery"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Название (TR)
                    </label>
                    <input
                      value={editing.name.tr}
                      onChange={e => setEditing({ ...editing, name: { ...editing.name, tr: e.target.value } })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                      placeholder="Fırın ürünleri"
                    />
                  </div>
                </div>

                {/* Color & Gradient */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Цвет иконки
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editing.iconColor}
                        onChange={e => setEditing({ ...editing, iconColor: e.target.value })}
                        className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer"
                      />
                      <input
                        value={editing.iconColor}
                        onChange={e => setEditing({ ...editing, iconColor: e.target.value })}
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                        placeholder="#004FF1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Порядок
                    </label>
                    <input
                      type="number"
                      value={editing.order}
                      onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Градиент (Tailwind)
                  </label>
                  <input
                    value={editing.gradient}
                    onChange={e => setEditing({ ...editing, gradient: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    placeholder="from-blue-50 to-cyan-100"
                  />
                  <div className={`bg-gradient-to-r ${editing.gradient} mt-2 h-12 rounded-xl border border-slate-200`} />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => { setEditing(null); setIsNew(false) }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => save(editing)}
                  disabled={!editing.slug || !editing.name.ru}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: '#004FF1' }}
                >
                  <Save className="w-4 h-4" />
                  Сохранить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
