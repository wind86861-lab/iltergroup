import { useEffect, useState } from 'react'
import { MessageSquare, Mail, MailOpen, Trash2, Phone, X, CheckCheck } from 'lucide-react'
import {
  fetchMessages, setMessageRead, deleteMessage,
  type ApiMessage,
} from '../../lib/api'

type AdminMessage = ApiMessage

const fmtDate = (d: string) => {
  const diff = Date.now() - new Date(d).getTime()
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AdminMessage | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    let alive = true
    fetchMessages()
      .then(list => { if (alive) setMessages(list) })
      .catch(() => { /* ignore */ })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const markRead = async (id: number, read: boolean) => {
    const updated = await setMessageRead(id, read)
    setMessages(prev => prev.map(m => m.id === id ? updated : m))
    if (selected?.id === id) setSelected(updated)
  }

  const markAllRead = async () => {
    const unread = messages.filter(m => !m.isRead)
    await Promise.all(unread.map(m => setMessageRead(m.id, true)))
    setMessages(prev => prev.map(m => ({ ...m, isRead: true })))
  }

  const deleteMsg = async (id: number) => {
    await deleteMessage(id)
    setMessages(prev => prev.filter(m => m.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const open = (m: AdminMessage) => {
    setSelected(m)
    if (!m.isRead) markRead(m.id, true)
  }

  const filtered = filter === 'all' ? messages
    : filter === 'unread' ? messages.filter(m => !m.isRead)
      : messages.filter(m => m.isRead)

  const unread = messages.filter(m => !m.isRead).length

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Сообщения</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {messages.length} сообщений{unread > 0 && ` · ${unread} непрочитанных`}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:text-green-700 transition-all"
          >
            <CheckCheck className="w-4 h-4" />
            Прочитать все
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {([['all', 'Все', messages.length], ['unread', 'Новые', unread], ['read', 'Прочитанные', messages.length - unread]] as const).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold border transition-all"
            style={filter === key
              ? { background: '#004FF1', color: '#fff', borderColor: '#004FF1' }
              : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }}
          >
            {label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Messages list */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-semibold">{loading ? 'Загрузка...' : 'Нет сообщений'}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(m => (
              <div
                key={m.id}
                onClick={() => open(m)}
                className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-slate-50/60 ${selected?.id === m.id ? 'bg-green-50/40' : ''}`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${m.isRead ? 'bg-slate-100' : ''}`}
                  style={!m.isRead ? { background: '#eaf0fe' } : {}}>
                  {m.isRead
                    ? <MailOpen className="w-4.5 h-4.5 text-slate-400" />
                    : <Mail className="w-4.5 h-4.5" style={{ color: '#004FF1' }} />
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-[14px] truncate ${m.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                      {m.name}
                    </p>
                    <p className="text-[11px] text-slate-400 flex-shrink-0">{fmtDate(m.createdAt)}</p>
                  </div>
                  <p className="text-[12px] text-slate-400 flex items-center gap-1 mb-1">
                    <Phone className="w-3 h-3" />
                    {m.phone}
                  </p>
                  <p className={`text-[13px] truncate ${m.isRead ? 'text-slate-400' : 'text-slate-600'}`}>{m.comment}</p>
                </div>

                {/* Unread dot */}
                {!m.isRead && (
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: '#004FF1' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Panel */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSelected(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-[15px] font-bold text-slate-900">Сообщение</h2>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Sender info */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold" style={{ background: '#004FF1' }}>
                  {selected.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-slate-900">{selected.name}</p>
                  <a href={`tel:${selected.phone}`} className="text-[13px] text-slate-500 hover:text-green-600 flex items-center gap-1 transition-colors">
                    <Phone className="w-3 h-3" />
                    {selected.phone}
                  </a>
                </div>
              </div>

              {/* Message */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                <p className="text-[13px] font-semibold text-slate-500 mb-2">Сообщение:</p>
                <p className="text-[14px] text-slate-800 leading-relaxed">{selected.comment}</p>
              </div>

              <p className="text-[12px] text-slate-400 mb-6">{fmtDate(selected.createdAt)}</p>

              {/* Actions */}
              <div className="space-y-2.5">
                <a
                  href={`tel:${selected.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: '#004FF1' }}
                >
                  <Phone className="w-4 h-4" />
                  Позвонить клиенту
                </a>
                <button
                  onClick={() => markRead(selected.id, !selected.isRead)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {selected.isRead ? <><Mail className="w-4 h-4" /> Отметить непрочитанным</> : <><MailOpen className="w-4 h-4" /> Отметить прочитанным</>}
                </button>
                <button
                  onClick={() => deleteMsg(selected.id)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
