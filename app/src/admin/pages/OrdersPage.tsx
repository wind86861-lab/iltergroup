import { useEffect, useState } from 'react'
import { Clock, TrendingUp, Truck, CheckCircle, XCircle, ChevronDown, X } from 'lucide-react'
import { OrderStatus } from '../types'
import { fetchOrders, updateOrderStatus, type ApiOrder } from '../../lib/api'

type AdminOrder = ApiOrder

const STATUS_CFG: Record<OrderStatus, { label: string; bg: string; color: string; Icon: React.ElementType }> = {
  pending:    { label: 'Ожидает',      bg: '#fef9c3', color: '#a16207', Icon: Clock },
  processing: { label: 'В обработке', bg: '#dbeafe', color: '#1d4ed8', Icon: TrendingUp },
  shipped:    { label: 'В пути',      bg: '#f3e8ff', color: '#7e22ce', Icon: Truck },
  delivered:  { label: 'Доставлен',   bg: '#dcfce7', color: '#166534', Icon: CheckCircle },
  cancelled:  { label: 'Отменён',     bg: '#fee2e2', color: '#dc2626', Icon: XCircle },
}

const STATUSES = Object.entries(STATUS_CFG) as [OrderStatus, typeof STATUS_CFG[OrderStatus]][]

const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(n) + ' сум'
const fmtDate = (d: string) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [selected, setSelected] = useState<AdminOrder | null>(null)

  useEffect(() => {
    let alive = true
    fetchOrders()
      .then(list => { if (alive) setOrders(list) })
      .catch(() => { /* ignore */ })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const updateStatus = async (id: number, status: OrderStatus) => {
    const updated = await updateOrderStatus(id, status)
    setOrders(prev => prev.map(o => o.id === id ? updated : o))
    if (selected?.id === id) setSelected(updated)
  }

  const counts = Object.fromEntries(
    (['all', ...Object.keys(STATUS_CFG)] as (OrderStatus | 'all')[]).map(s => [
      s, s === 'all' ? orders.length : orders.filter(o => o.status === s).length
    ])
  )

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Заказы</h1>
        <p className="text-sm text-slate-400 mt-0.5">{orders.length} заказов всего</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {(['all', ...Object.keys(STATUS_CFG)] as (OrderStatus | 'all')[]).map(s => {
          const cfg = s !== 'all' ? STATUS_CFG[s as OrderStatus] : null
          const active = filter === s
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold border transition-all"
              style={active
                ? { background: '#004FF1', color: '#fff', borderColor: '#004FF1' }
                : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }}
            >
              {s === 'all' ? 'Все' : cfg!.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {counts[s]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100" style={{ background: '#f8fafc' }}>
                {['Заказ', 'Клиент', 'Товары', 'Сумма', 'Дата', 'Статус', 'Действие'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[12px] font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(o => {
                const cfg = STATUS_CFG[o.status]
                const Icon = cfg.Icon
                return (
                  <tr
                    key={o.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelected(o)}
                  >
                    <td className="px-5 py-4 text-[13px] font-bold text-slate-700 whitespace-nowrap">{o.id}</td>
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-semibold text-slate-800 whitespace-nowrap">{o.customer}</p>
                      <p className="text-[11.5px] text-slate-400">{o.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-slate-600 whitespace-nowrap">{o.items.length} позиц.</td>
                    <td className="px-5 py-4 text-[13px] font-bold text-slate-800 whitespace-nowrap">{fmt(o.total)}</td>
                    <td className="px-5 py-4 text-[12px] text-slate-400 whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 w-fit text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: cfg.bg, color: cfg.color }}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <div className="relative group">
                        <button className="flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                          Статус <ChevronDown className="w-3 h-3" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-slate-100 shadow-xl z-10 overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                          {STATUSES.map(([key, cfg]) => (
                            <button
                              key={key}
                              onClick={() => updateStatus(o.id, key)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-left hover:bg-slate-50 transition-colors"
                              style={{ color: o.status === key ? cfg.color : '#64748b', fontWeight: o.status === key ? 700 : 500 }}
                            >
                              <cfg.Icon className="w-3.5 h-3.5" />
                              {cfg.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <p className="font-semibold">{loading ? 'Загрузка...' : 'Нет заказов'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setSelected(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-[440px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selected.id}</h2>
                <p className="text-xs text-slate-400">{fmtDate(selected.createdAt)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Status */}
              <div>
                <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide mb-2">Статус заказа</p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => updateStatus(selected.id, key)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border-2 transition-all"
                      style={selected.status === key
                        ? { background: cfg.bg, color: cfg.color, borderColor: cfg.color }
                        : { background: '#f8fafc', color: '#94a3b8', borderColor: 'transparent' }}
                    >
                      <cfg.Icon className="w-3 h-3" />
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-1.5">
                <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide mb-2">Клиент</p>
                <p className="text-[14px] font-bold text-slate-800">{selected.customer}</p>
                <p className="text-[13px] text-slate-500">{selected.phone}</p>
                {selected.email && <p className="text-[13px] text-slate-500">{selected.email}</p>}
                {selected.notes && <p className="text-[12px] text-slate-400 italic mt-2">«{selected.notes}»</p>}
              </div>

              {/* Items */}
              <div>
                <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide mb-3">Товары</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-[13px] font-semibold text-slate-800">{item.name}</p>
                        <p className="text-[11.5px] text-slate-400">{item.qty} шт. × {fmt(item.price)}</p>
                      </div>
                      <p className="text-[13px] font-bold text-slate-800">{fmt(item.qty * item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl" style={{ background: '#eaf0fe' }}>
                <p className="text-[14px] font-bold text-slate-800">Итого</p>
                <p className="text-[18px] font-bold" style={{ color: '#004FF1' }}>{fmt(selected.total)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
