import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, MessageSquare, TrendingUp, Clock, CheckCircle, XCircle, Truck, ArrowRight, FileText, Upload, Trash2, Download, ListOrdered, Users, PanelBottom, Award, Sparkles } from 'lucide-react'
import { fetchProducts, fetchOrders, fetchMessages, fetchCatalog, uploadCatalog, deleteCatalog, fetchSteps, fetchPartners, fetchBenefits, type Product, type ApiOrder, type ApiMessage, type CatalogInfo, API_BASE } from '../../lib/api'
import { OrderStatus } from '../types'
import { useTranslation } from 'react-i18next'

const STATUS: Record<OrderStatus, { label: string; bg: string; color: string; Icon: React.ElementType }> = {
  pending: { label: 'Ожидает', bg: '#fefce8', color: '#a16207', Icon: Clock },
  processing: { label: 'В обработке', bg: '#eff6ff', color: '#1d4ed8', Icon: TrendingUp },
  shipped: { label: 'В пути', bg: '#faf5ff', color: '#7e22ce', Icon: Truck },
  delivered: { label: 'Доставлен', bg: '#f0fdf4', color: '#15803d', Icon: CheckCircle },
  cancelled: { label: 'Отменён', bg: '#fef2f2', color: '#dc2626', Icon: XCircle },
}

const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(n) + ' сум'

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`
  return `${Math.floor(diff / 86400000)} дн назад`
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [messages, setMessages] = useState<ApiMessage[]>([])
  const [catalog, setCatalog] = useState<CatalogInfo | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [stepsCount, setStepsCount] = useState(0)
  const [partnersCount, setPartnersCount] = useState(0)
  const [benefitsCount, setBenefitsCount] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let alive = true
    Promise.allSettled([
      fetchProducts(),
      fetchOrders(),
      fetchMessages(),
      fetchCatalog(),
      fetchSteps(),
      fetchPartners(),
      fetchBenefits(),
    ]).then(([p, o, m, c, s, pr, b]) => {
      if (!alive) return
      if (p.status === 'fulfilled') setProducts(p.value)
      if (o.status === 'fulfilled') setOrders(o.value)
      if (m.status === 'fulfilled') setMessages(m.value)
      if (c.status === 'fulfilled') setCatalog(c.value)
      if (s.status === 'fulfilled') setStepsCount(s.value.length)
      if (pr.status === 'fulfilled') setPartnersCount(pr.value.length)
      if (b.status === 'fulfilled') setBenefitsCount(b.value.length)
    })
    return () => { alive = false }
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCatalogLoading(true)
    try {
      const res = await uploadCatalog(file)
      setCatalog(res)
    } catch (err) {
      console.error(err)
      alert('Ошибка загрузки каталога')
    } finally {
      setCatalogLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!confirm('Удалить каталог?')) return
    setCatalogLoading(true)
    try {
      await deleteCatalog()
      setCatalog({ exists: false })
    } catch (err) {
      console.error(err)
    } finally {
      setCatalogLoading(false)
    }
  }

  const pending = orders.filter(o => o.status === 'pending').length
  const unread = messages.filter(m => !m.isRead).length
  const revenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0)

  const recent = [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5)

  const catCounts = [
    { label: 'Хлебобулочные', count: products.filter(p => p.category === 'bread').length, bar: '#f59e0b' },
    { label: 'Сладости', count: products.filter(p => p.category === 'sweet').length, bar: '#fb7185' },
    { label: 'Фрукты', count: products.filter(p => p.category === 'fruit').length, bar: '#34d399' },
  ]

  const STATS = [
    { label: 'Продуктов', value: products.length, sub: 'в каталоге', icon: Package, bg: '#eaf0fe', color: '#004FF1' },
    { label: 'Заказов', value: orders.length, sub: `${pending} ожидают`, icon: ShoppingBag, bg: '#eff6ff', color: '#2563eb' },
    { label: 'Сообщений', value: messages.length, sub: `${unread} новых`, icon: MessageSquare, bg: '#faf5ff', color: '#7c3aed' },
    { label: 'Выручка', value: fmt(revenue), sub: 'доставленные', icon: TrendingUp, bg: '#fef9c3', color: '#ca8a04' },
  ]

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: s.bg }}>
                <Icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-bold text-slate-900 leading-none mb-1.5 truncate">{s.value}</p>
              <p className="text-[13px] font-medium text-slate-500">{s.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{s.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h2 className="font-bold text-slate-800">Последние заказы</h2>
            <Link to="/admin/orders" className="flex items-center gap-1 text-xs font-semibold text-brand hover:opacity-80">
              Все <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recent.map(o => {
              const s = STATUS[o.status]
              const Icon = s.Icon
              return (
                <div key={o.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                    <Icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-slate-800 truncate">{o.customer}</p>
                    <p className="text-[11.5px] text-slate-400">{o.items.length} поз. · {timeAgo(o.createdAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-bold text-slate-800">{fmt(o.total)}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: category + catalog + messages */}
        <div className="space-y-4">
          {/* Catalog upload */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">Каталог</h2>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#eff6ff' }}>
                <FileText className="w-4 h-4" style={{ color: '#2563eb' }} />
              </div>
            </div>
            {catalog?.exists ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">catalog.pdf</p>
                    <p className="text-[11px] text-slate-400">
                      {catalog.size ? `${(catalog.size / 1024 / 1024).toFixed(2)} MB` : ''}
                      {catalog.updatedAt ? ` · ${new Date(catalog.updatedAt).toLocaleDateString('ru-RU')}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`${API_BASE}/uploads/catalog.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white bg-brand rounded-xl py-2.5 no-underline hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-4 h-4" />
                    Скачать
                  </a>
                  <button
                    onClick={handleDelete}
                    disabled={catalogLoading}
                    className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-red-500 bg-red-50 rounded-xl px-4 py-2.5 border-none cursor-pointer hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={catalogLoading}
                  className="w-full flex items-center justify-center gap-2 text-[13px] font-semibold text-slate-600 bg-slate-50 rounded-xl py-2.5 border-none cursor-pointer hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  Заменить
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[13px] text-slate-500 text-center py-2">Каталог не загружен</p>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={catalogLoading}
                  className="w-full flex items-center justify-center gap-2 text-[14px] font-semibold text-white bg-brand rounded-xl py-3 border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {catalogLoading ? 'Загрузка...' : 'Загрузить PDF'}
                </button>
              </div>
            )}
            <p className="text-[11.5px] text-slate-400 mt-2">{t('admin.images.catalog_hint')}</p>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Dynamic Sections Overview */}
          <div className="bg-gradient-to-br from-brand/5 to-brand/10 rounded-2xl border border-brand/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-brand" />
              <h2 className="font-bold text-slate-800">Динамические секции</h2>
            </div>
            <div className="space-y-2">
              <Link to="/admin/steps" className="flex items-center justify-between p-3 bg-white/80 hover:bg-white rounded-xl border border-slate-100 no-underline transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <ListOrdered className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">Как мы работаем</p>
                    <p className="text-[11px] text-slate-400">Шаги процесса</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-slate-600">{stepsCount}</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand transition-colors" />
                </div>
              </Link>

              <Link to="/admin/partners" className="flex items-center justify-between p-3 bg-white/80 hover:bg-white rounded-xl border border-slate-100 no-underline transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Users className="w-4.5 h-4.5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">Наши партнёры</p>
                    <p className="text-[11px] text-slate-400">Бегущая строка</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-slate-600">{partnersCount}</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand transition-colors" />
                </div>
              </Link>

              <Link to="/admin/benefits" className="flex items-center justify-between p-3 bg-white/80 hover:bg-white rounded-xl border border-slate-100 no-underline transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Award className="w-4.5 h-4.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">Почему мы</p>
                    <p className="text-[11px] text-slate-400">Преимущества</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-slate-600">{benefitsCount}</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand transition-colors" />
                </div>
              </Link>

              <Link to="/admin/footer" className="flex items-center justify-between p-3 bg-white/80 hover:bg-white rounded-xl border border-slate-100 no-underline transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                    <PanelBottom className="w-4.5 h-4.5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">Футер сайта</p>
                    <p className="text-[11px] text-slate-400">Контакты и ссылки</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand transition-colors" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="font-bold text-slate-800 mb-4">Категории</h2>
            <div className="space-y-3.5">
              {catCounts.map(c => (
                <div key={c.label}>
                  <div className="flex justify-between text-[13px] mb-1.5">
                    <span className="text-slate-600">{c.label}</span>
                    <span className="font-bold text-slate-800">{c.count} шт</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${products.length > 0 ? (c.count / products.length) * 100 : 0}%`, background: c.bar }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
              <h2 className="font-bold text-slate-800">Сообщения</h2>
              {unread > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#004FF1' }}>{unread} новых</span>
              )}
            </div>
            <div className="divide-y divide-slate-50">
              {messages.slice(0, 3).map(m => (
                <div key={m.id} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0`} style={{ background: m.isRead ? '#cbd5e1' : '#004FF1' }} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800">{m.name}</p>
                    <p className="text-[11.5px] text-slate-400 truncate">{m.comment}</p>
                  </div>
                </div>
              ))}
              <div className="px-5 py-3">
                <Link to="/admin/messages" className="text-xs font-semibold text-brand hover:opacity-80 flex items-center gap-1">
                  Все сообщения <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
